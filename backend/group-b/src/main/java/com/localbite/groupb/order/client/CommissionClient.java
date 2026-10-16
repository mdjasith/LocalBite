package com.localbite.groupb.order.client;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@Component("order_CommissionClient")
public class CommissionClient {

    private final RestTemplate restTemplate;

    @Value("${services.commission.url}")
    private String commissionServiceUrl;

    public CommissionClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    /**
     * Record commission for a delivered order.
     * Called by OrderService.verifyDelivery() after OTP succeeds.
     */
    public void record(Long orderId,
                       Long sellerId,
                       BigDecimal foodSubtotal,
                       BigDecimal commissionAmount,
                       BigDecimal sellerAmount,
                       String jwt) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + jwt);

            Map<String, Object> body = new HashMap<>();
            body.put("orderId", orderId);
            body.put("sellerId", sellerId);
            body.put("foodSubtotal", foodSubtotal);
            body.put("commissionPercentage", new BigDecimal("10.00"));
            body.put("commissionAmount", commissionAmount);
            body.put("sellerAmount", sellerAmount);

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

            restTemplate.postForEntity(
                    commissionServiceUrl + "/api/commissions/record",
                    entity,
                    Map.class
            );
        } catch (Exception e) {
            // Don't fail the delivery if commission recording fails.
            // Commission can be recorded later by an admin.
        }
    }
}