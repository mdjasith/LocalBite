package com.localbite.groupb.food.client;

import com.localbite.groupb.food.dto.SellerInfo;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component("food_SellerClient")
public class SellerClient {

    private final RestTemplate restTemplate;

    @Value("${services.seller.url}")
    private String sellerServiceUrl;

    public SellerClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public SellerInfo getCurrentSeller(String jwtToken) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + jwtToken);

            HttpEntity<Void> entity = new HttpEntity<>(headers);

            ResponseEntity<SellerInfo> response = restTemplate.exchange(
                    sellerServiceUrl + "/api/sellers/me",
                    HttpMethod.GET,
                    entity,
                    SellerInfo.class
            );
            return response.getBody();
        } catch (Exception e) {
            throw new RuntimeException("Could not verify seller with Seller Service: " + e.getMessage());
        }
    }
}
