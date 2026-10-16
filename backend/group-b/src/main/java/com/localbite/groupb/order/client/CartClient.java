package com.localbite.groupb.order.client;

import com.localbite.groupb.order.dto.CartInfo;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component("order_CartClient")
public class CartClient {

    private final RestTemplate restTemplate;

    @Value("${services.cart.url}")
    private String cartServiceUrl;

    public CartClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public CartInfo getCart(String jwtToken) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + jwtToken);
            HttpEntity<Void> entity = new HttpEntity<>(headers);

            ResponseEntity<CartInfo> response = restTemplate.exchange(
                    cartServiceUrl + "/api/carts/me",
                    HttpMethod.GET,
                    entity,
                    CartInfo.class
            );
            return response.getBody();
        } catch (Exception e) {
            throw new RuntimeException("Could not fetch cart: " + e.getMessage());
        }
    }

    public void clearCart(String jwtToken) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + jwtToken);
            HttpEntity<Void> entity = new HttpEntity<>(headers);

            restTemplate.exchange(
                    cartServiceUrl + "/api/carts/me",
                    HttpMethod.DELETE,
                    entity,
                    Void.class
            );
        } catch (Exception e) {
            // Log but don't fail order
        }
    }
}
