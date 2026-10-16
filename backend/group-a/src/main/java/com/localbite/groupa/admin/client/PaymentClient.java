package com.localbite.groupa.admin.client;

import com.localbite.groupa.admin.dto.PaymentInfo;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

@Component
public class PaymentClient {

    private final RestTemplate restTemplate;

    @Value("${services.payment.url}")
    private String baseUrl;

    public PaymentClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public List<PaymentInfo> listAllPayments(String adminJwt) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + adminJwt);
            HttpEntity<Void> entity = new HttpEntity<>(headers);

            ResponseEntity<PaymentInfo[]> resp = restTemplate.exchange(
                    baseUrl + "/api/payments",
                    HttpMethod.GET, entity, PaymentInfo[].class);

            PaymentInfo[] arr = resp.getBody();
            return arr == null ? Collections.emptyList() : Arrays.asList(arr);
        } catch (Exception e) {
            return Collections.emptyList();
        }
    }
}
