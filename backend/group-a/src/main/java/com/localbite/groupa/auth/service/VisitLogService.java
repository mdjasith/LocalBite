package com.localbite.groupa.auth.service;

import com.localbite.groupa.auth.dto.TrackVisitRequest;
import com.localbite.groupa.auth.entity.VisitLog;
import com.localbite.groupa.auth.repository.VisitLogRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

@Service
public class VisitLogService {

    private static final Logger log = LoggerFactory.getLogger(VisitLogService.class);
    private final VisitLogRepository repo;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public VisitLogService(VisitLogRepository repo) {
        this.repo = repo;
    }

    @Transactional
    public VisitLog track(TrackVisitRequest req, HttpServletRequest http) {
        VisitLog v = new VisitLog();
        v.setVisitorId(req.getVisitorId());
        v.setUserId(req.getUserId());
        v.setEmail(req.getEmail());
        v.setRole(req.getRole());
        v.setEventType(req.getEventType() == null ? "VISIT" : req.getEventType().toUpperCase());
        v.setPage(req.getPage());
        v.setReferrer(req.getReferrer());
        v.setUserAgent(truncate(http.getHeader("User-Agent"), 500));

        String ip = resolveIp(http);
        v.setIpAddress(ip);

        // Look up location only for public IPs (skip localhost)
        if (ip != null && !isLocalIp(ip)) {
            Map<String, String> loc = lookupLocation(ip);
            v.setCity(loc.get("city"));
            v.setRegion(loc.get("region"));
            v.setCountry(loc.get("country"));
        } else {
            v.setCity("Local");
            v.setRegion("Dev");
            v.setCountry("Local");
        }

        return repo.save(v);
    }

    public Map<String, Object> summary() {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startOfToday = now.toLocalDate().atStartOfDay();
        LocalDateTime last7 = now.minusDays(7);
        LocalDateTime last30 = now.minusDays(30);

        Map<String, Object> out = new LinkedHashMap<>();
        out.put("today", buildPeriod(startOfToday));
        out.put("last7Days", buildPeriod(last7));
        out.put("last30Days", buildPeriod(last30));
        return out;
    }

    private Map<String, Object> buildPeriod(LocalDateTime since) {
        Map<String, Object> p = new LinkedHashMap<>();
        p.put("totalVisits", repo.countByTypeSince("VISIT", since));
        p.put("pageViews", repo.countByTypeSince("PAGE_VIEW", since));
        p.put("uniqueVisitors", repo.uniqueVisitorsSince(since));
        p.put("logins", repo.countByTypeSince("LOGIN", since));
        p.put("loginsCustomer", repo.countByRoleAndTypeSince("CUSTOMER", "LOGIN", since));
        p.put("loginsSeller", repo.countByRoleAndTypeSince("SELLER", "LOGIN", since));
        p.put("loginsAdmin", repo.countByRoleAndTypeSince("ADMIN", "LOGIN", since));
        p.put("registrations", repo.countByTypeSince("REGISTER", since));
        p.put("registrationsCustomer", repo.countByRoleAndTypeSince("CUSTOMER", "REGISTER", since));
        p.put("registrationsSeller", repo.countByRoleAndTypeSince("SELLER", "REGISTER", since));
        return p;
    }

    public List<Map<String, Object>> topCountries(int days) {
        LocalDateTime since = LocalDateTime.now().minusDays(days);
        List<Object[]> rows = repo.topCountriesSince(since, PageRequest.of(0, 20));
        List<Map<String, Object>> out = new ArrayList<>();
        for (Object[] r : rows) {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("country", r[0]);
            m.put("count", r[1]);
            out.add(m);
        }
        return out;
    }

    public List<Map<String, Object>> topCities(int days) {
        LocalDateTime since = LocalDateTime.now().minusDays(days);
        List<Object[]> rows = repo.topCitiesSince(since, PageRequest.of(0, 20));
        List<Map<String, Object>> out = new ArrayList<>();
        for (Object[] r : rows) {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("city", r[0]);
            m.put("country", r[1]);
            m.put("count", r[2]);
            out.add(m);
        }
        return out;
    }

    public List<Map<String, Object>> recent(int limit) {
        return toMapList(repo.findAllByOrderByCreatedAtDesc(PageRequest.of(0, limit)));
    }

    public List<Map<String, Object>> recentLogins(int limit) {
        return toMapList(repo.recentLogins(PageRequest.of(0, limit)));
    }

    private List<Map<String, Object>> toMapList(List<VisitLog> logs) {
        List<Map<String, Object>> out = new ArrayList<>();
        for (VisitLog v : logs) {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", v.getId());
            m.put("visitorId", v.getVisitorId());
            m.put("userId", v.getUserId());
            m.put("email", v.getEmail());
            m.put("role", v.getRole());
            m.put("eventType", v.getEventType());
            m.put("page", v.getPage());
            m.put("ipAddress", v.getIpAddress());
            m.put("city", v.getCity());
            m.put("region", v.getRegion());
            m.put("country", v.getCountry());
            m.put("userAgent", v.getUserAgent());
            m.put("createdAt", v.getCreatedAt());
            out.add(m);
        }
        return out;
    }

    // ---------------- helpers ----------------

    private String resolveIp(HttpServletRequest req) {
        String[] headers = { "X-Forwarded-For", "X-Real-IP", "CF-Connecting-IP" };
        for (String h : headers) {
            String v = req.getHeader(h);
            if (v != null && !v.isBlank()) {
                int comma = v.indexOf(',');
                return (comma > 0 ? v.substring(0, comma) : v).trim();
            }
        }
        return req.getRemoteAddr();
    }

    private boolean isLocalIp(String ip) {
        if (ip == null) return true;
        return ip.equals("127.0.0.1")
                || ip.equals("0:0:0:0:0:0:0:1")
                || ip.equals("::1")
                || ip.startsWith("192.168.")
                || ip.startsWith("10.")
                || ip.startsWith("172.16.")
                || ip.startsWith("172.17.")
                || ip.startsWith("172.18.")
                || ip.startsWith("172.19.")
                || ip.startsWith("172.2")
                || ip.startsWith("172.30.")
                || ip.startsWith("172.31.");
    }

    /** Free IP geolocation via ip-api.com (no API key, 45 req/min) */
    private Map<String, String> lookupLocation(String ip) {
        Map<String, String> loc = new HashMap<>();
        try {
            String url = "http://ip-api.com/json/" + ip + "?fields=status,country,city,regionName";
            java.net.http.HttpClient client = java.net.http.HttpClient.newHttpClient();
            java.net.http.HttpRequest req = java.net.http.HttpRequest.newBuilder()
                    .uri(java.net.URI.create(url))
                    .timeout(java.time.Duration.ofSeconds(4))
                    .GET().build();
            java.net.http.HttpResponse<String> res = client.send(req,
                    java.net.http.HttpResponse.BodyHandlers.ofString());
            JsonNode root = objectMapper.readTree(res.body());
            if ("success".equals(root.path("status").asText())) {
                loc.put("country", root.path("country").asText(""));
                loc.put("city", root.path("city").asText(""));
                loc.put("region", root.path("regionName").asText(""));
            }
        } catch (Exception e) {
            log.warn("[visits] geolocation failed for {}: {}", ip, e.getMessage());
        }
        return loc;
    }

    private String truncate(String s, int max) {
        if (s == null) return null;
        return s.length() > max ? s.substring(0, max) : s;
    }
}