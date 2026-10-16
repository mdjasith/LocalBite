package com.localbite.groupb.order.client;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.HttpServerErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Component("order_DeliveryClient")
public class DeliveryClient {

    private final RestTemplate restTemplate;

    @Value("${services.delivery.url}")
    private String deliveryServiceUrl;

    public DeliveryClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public void create(Long orderId, String jwt) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + jwt);
            Map<String, Object> body = Map.of("orderId", orderId);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
            restTemplate.postForEntity(
                    deliveryServiceUrl + "/api/deliveries/create",
                    entity, Map.class);
        } catch (Exception ignored) { }
    }

    public void generateOtp(Long orderId, String jwt) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + jwt);
            HttpEntity<Void> entity = new HttpEntity<>(headers);
            restTemplate.postForEntity(
                    deliveryServiceUrl + "/api/deliveries/order/" + orderId + "/generate-otp",
                    entity, Map.class);
        } catch (Exception ignored) { }
    }

    @SuppressWarnings("unchecked")
    public Map<String, Object> viewOtp(Long orderId, String jwt) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + jwt);
            HttpEntity<Void> entity = new HttpEntity<>(headers);
            ResponseEntity<Map> response = restTemplate.exchange(
                    deliveryServiceUrl + "/api/deliveries/order/" + orderId + "/view-otp",
                    HttpMethod.GET, entity, Map.class);
            return response.getBody();
        } catch (Exception e) {
            return null;
        }
    }

    public void verifyOtp(Long orderId, String otp, String jwt) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", "Bearer " + jwt);

        Map<String, String> body = Map.of("otp", otp);
        HttpEntity<Map<String, String>> entity = new HttpEntity<>(body, headers);

        try {
            restTemplate.postForEntity(
                    deliveryServiceUrl + "/api/deliveries/order/" + orderId + "/verify-otp",
                    entity, Map.class);
        } catch (HttpClientErrorException | HttpServerErrorException e) {
            String responseBody = e.getResponseBodyAsString();
            String message = extractMessage(responseBody);
            throw new RuntimeException(message);
        } catch (Exception e) {
            throw new RuntimeException("Delivery verification failed: " + e.getMessage());
        }
    }

    /**
     * Admin override: force delivery status (e.g., DELIVERED) without OTP.
     */
    public void updateStatus(Long orderId, String status, String jwt) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + jwt);
            Map<String, Object> body = Map.of("status", status);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
            restTemplate.exchange(
                    deliveryServiceUrl + "/api/deliveries/order/" + orderId + "/status",
                    HttpMethod.PUT, entity, Map.class);
        } catch (Exception ignored) { }
    }

    private String extractMessage(String body) {
        if (body == null) return "OTP verification failed";
        int idx = body.indexOf("\"message\":\"");
        if (idx < 0) return "OTP verification failed";
        int start = idx + 11;
        int end = body.indexOf('"', start);
        if (end < 0) return "OTP verification failed";
        return body.substring(start, end);
    }
}