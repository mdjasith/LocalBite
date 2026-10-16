package com.localbite.groupb.order.client;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component("order_PaymentClient")
public class PaymentClient {

    private final RestTemplate restTemplate;

    @Value("${services.payment.url}")
    private String paymentServiceUrl;

    public PaymentClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    /** Ask payment-service to refund the payment tied to this order. */
    public boolean refundOrder(Long orderId, String jwt) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + jwt);
            HttpEntity<Void> entity = new HttpEntity<>(headers);
            restTemplate.exchange(
                    paymentServiceUrl + "/api/payments/order/" + orderId + "/refund",
                    HttpMethod.PUT, entity, Object.class);
            return true;
        } catch (Exception e) {
            System.err.println("[order] Refund failed for order " + orderId + ": " + e.getMessage());
            return false;
        }
    }
}