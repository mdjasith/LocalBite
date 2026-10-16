package com.localbite.groupd.review.client;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Component("review_UserClient")
public class UserClient {

    private final RestTemplate restTemplate;

    @Value("${services.user.url}")
    private String userServiceUrl;

    public UserClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public String getFullName(Long userId, String jwt) {
        if (userId == null) return null;
        try {
            HttpHeaders headers = new HttpHeaders();
            if (jwt != null && !jwt.isBlank()) {
                headers.set("Authorization", "Bearer " + jwt);
            }
            HttpEntity<Void> entity = new HttpEntity<>(headers);
            ResponseEntity<Map> resp = restTemplate.exchange(
                    userServiceUrl + "/api/users/" + userId,
                    HttpMethod.GET, entity, Map.class);
            Map<?, ?> body = resp.getBody();
            if (body == null) return null;
            Object name = body.get("fullName");
            return name == null ? null : name.toString();
        } catch (Exception e) {
            return null;
        }
    }
}