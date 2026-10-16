package com.localbite.groupc.commission.client;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Component("commission_SellerClient")
public class SellerClient {

    private final RestTemplate restTemplate;

    @Value("${services.seller.url}")
    private String sellerServiceUrl;

    public SellerClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public Long getSellerIdByAuthUserId(Long authUserId, String jwtToken) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + jwtToken);
            HttpEntity<Void> entity = new HttpEntity<>(headers);

            ResponseEntity<Map> response = restTemplate.exchange(
                    sellerServiceUrl + "/api/sellers/me",
                    HttpMethod.GET,
                    entity,
                    Map.class
            );

            Map<?, ?> body = response.getBody();
            if (body == null) return null;

            Object sellerId = body.get("sellerId");
            if (sellerId instanceof Number) {
                return ((Number) sellerId).longValue();
            }
            return null;
        } catch (Exception e) {
            return null;
        }
    }
}