package com.localbite.groupc.payment.client;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Component("payment_OrderClient")
public class OrderClient {

    private final RestTemplate restTemplate;

    @Value("${services.order.url}")
    private String orderServiceUrl;

    public OrderClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    /** Tell order-service that this order has been paid. Retries up to 3 times. */
    public void markOrderPaid(Long orderId, String jwtToken) {
        int attempts = 0;
        int maxAttempts = 3;
        while (attempts < maxAttempts) {
            attempts++;
            try {
                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);
                if (jwtToken != null && !jwtToken.isBlank()) {
                    headers.set("Authorization", "Bearer " + jwtToken);
                }
                HttpEntity<Map<String, Object>> entity = new HttpEntity<>(
                        Map.of("paid", true), headers);
                restTemplate.exchange(
                        orderServiceUrl + "/api/orders/" + orderId + "/mark-paid",
                        HttpMethod.PUT, entity, Void.class);
                System.out.println("[payment] Order " + orderId + " marked paid (attempt " + attempts + ")");
                return;
            } catch (Exception e) {
                System.err.println("[payment] mark-paid attempt " + attempts + " failed for order "
                        + orderId + ": " + e.getMessage());
                if (attempts < maxAttempts) {
                    try { Thread.sleep(500); } catch (InterruptedException ignored) {}
                }
            }
        }
        System.err.println("[payment] Gave up marking order " + orderId + " as paid after "
                + maxAttempts + " attempts");
    }
}