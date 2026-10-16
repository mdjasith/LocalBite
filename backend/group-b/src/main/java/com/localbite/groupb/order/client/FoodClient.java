package com.localbite.groupb.order.client;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@Component("orderFoodClient")
public class FoodClient {

    private final RestTemplate restTemplate;

    @Value("${services.food.url}")
    private String foodServiceUrl;

    public FoodClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    /**
     * Adjust stock by a signed delta.
     * delta < 0 â†’ reduce stock (order placed)
     * delta > 0 â†’ restore stock (order cancelled)
     * Silent on failure â€” never breaks the order flow.
     */
    public void adjustStock(Long foodId, Integer delta, String jwt) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            if (jwt != null && !jwt.isBlank()) {
                headers.set("Authorization", "Bearer " + jwt);
            }
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(
                    Map.of("delta", delta), headers);
            restTemplate.exchange(
                    foodServiceUrl + "/api/foods/" + foodId + "/adjust-stock",
                    HttpMethod.PUT, entity, Object.class);
        } catch (Exception e) {
            System.err.println("[order] adjust stock failed for food "
                    + foodId + ": " + e.getMessage());
        }
    }

    /**
     * Validate that the food is orderable and has enough stock.
     * Throws RuntimeException with the food-service message if not.
     * Ignores transient network failures so order placement can continue.
     */
    public void assertStock(Long foodId, Integer qty, String jwt) {
        try {
            HttpHeaders headers = new HttpHeaders();
            if (jwt != null && !jwt.isBlank()) {
                headers.set("Authorization", "Bearer " + jwt);
            }
            HttpEntity<Void> entity = new HttpEntity<>(headers);
            restTemplate.exchange(
                    foodServiceUrl + "/api/foods/" + foodId + "/check-stock?qty=" + qty,
                    HttpMethod.GET, entity, Object.class);
        } catch (HttpClientErrorException e) {
            String body = e.getResponseBodyAsString();
            String msg = extractMessage(body, "Out of stock");
            throw new RuntimeException(msg);
        } catch (Exception e) {
            // Transient error (food-service down) â€” don't block the order
            System.err.println("[order] check-stock failed for food "
                    + foodId + ": " + e.getMessage());
        }
    }

    /** Pull a "message" field out of a JSON error body â€” used when the food-service responds 400. */
    private String extractMessage(String body, String fallback) {
        if (body == null) return fallback;
        int i = body.indexOf("\"message\":\"");
        if (i < 0) return fallback;
        int start = i + 11;
        int end = body.indexOf('"', start);
        if (end < 0) return fallback;
        return body.substring(start, end);
    }
}