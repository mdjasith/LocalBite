package com.localbite.groupa.auth.controller;

import com.localbite.groupa.auth.dto.TrackVisitRequest;
import com.localbite.groupa.auth.entity.VisitLog;
import com.localbite.groupa.auth.service.VisitLogService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class VisitController {

    private final VisitLogService service;

    public VisitController(VisitLogService service) {
        this.service = service;
    }

    /** PUBLIC — called from the React app on every page/event */
    @PostMapping("/visits/track")
    public ResponseEntity<Map<String, Object>> track(
            @RequestBody TrackVisitRequest req,
            HttpServletRequest http) {
        VisitLog saved = service.track(req, http);
        return ResponseEntity.ok(Map.of("success", true, "id", saved.getId()));
    }

    /** ADMIN only */
    @GetMapping("/admin/visits/summary")
    public ResponseEntity<Map<String, Object>> summary() {
        return ResponseEntity.ok(service.summary());
    }

    @GetMapping("/admin/visits/countries")
    public ResponseEntity<List<Map<String, Object>>> countries(
            @RequestParam(defaultValue = "30") int days) {
        return ResponseEntity.ok(service.topCountries(days));
    }

    @GetMapping("/admin/visits/cities")
    public ResponseEntity<List<Map<String, Object>>> cities(
            @RequestParam(defaultValue = "30") int days) {
        return ResponseEntity.ok(service.topCities(days));
    }

    @GetMapping("/admin/visits/recent")
    public ResponseEntity<List<Map<String, Object>>> recent(
            @RequestParam(defaultValue = "100") int limit) {
        return ResponseEntity.ok(service.recent(limit));
    }

    @GetMapping("/admin/visits/logins")
    public ResponseEntity<List<Map<String, Object>>> recentLogins(
            @RequestParam(defaultValue = "100") int limit) {
        return ResponseEntity.ok(service.recentLogins(limit));
    }
}