package com.localbite.groupb.order.client;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@Component("order_NotificationClient")
public class NotificationClient {

    private final RestTemplate restTemplate;

    @Value("${services.notification.url}")
    private String notificationServiceUrl;

    public NotificationClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public void sendRefund(Long customerId, Long orderId, BigDecimal amount, String jwt) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            if (jwt != null && !jwt.isBlank()) {
                headers.set("Authorization", "Bearer " + jwt);
            }

            Map<String, Object> body = new HashMap<>();
            body.put("userId", customerId);
            body.put("notificationType", "ORDER_STATUS");
            body.put("title", "Refund processed");
            body.put("message", "Your order #LB" + orderId + " was cancelled. "
                    + "â‚¹" + amount + " has been refunded to your original payment method.");

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
            restTemplate.postForEntity(
                    notificationServiceUrl + "/api/notifications/send",
                    entity, Object.class);
        } catch (Exception e) {
            System.err.println("[order] refund notification failed: " + e.getMessage());
        }
    }

    public void sendOrderPaid(Long customerId, Long orderId, String jwt) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            if (jwt != null && !jwt.isBlank()) {
                headers.set("Authorization", "Bearer " + jwt);
            }

            Map<String, Object> body = new HashMap<>();
            body.put("userId", customerId);
            body.put("notificationType", "PAYMENT_SUCCESS");
            body.put("title", "Payment received");
            body.put("message", "Your payment for order #LB" + orderId + " was successful. "
                    + "The seller will start preparing your food.");

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
            restTemplate.postForEntity(
                    notificationServiceUrl + "/api/notifications/send",
                    entity, Object.class);
        } catch (Exception e) {
            System.err.println("[order] payment notification failed: " + e.getMessage());
        }
    }
}