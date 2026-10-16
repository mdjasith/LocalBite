package com.localbite.groupa.admin.client;

import com.localbite.groupa.admin.dto.SellerInfo;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

@Component
public class SellerClient {

    private final RestTemplate restTemplate;

    @Value("${services.seller.url}")
    private String baseUrl;

    public SellerClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public List<SellerInfo> listAllSellers(String adminJwt) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + adminJwt);
            HttpEntity<Void> entity = new HttpEntity<>(headers);

            ResponseEntity<SellerInfo[]> resp = restTemplate.exchange(
                    baseUrl + "/api/sellers/admin/all",
                    HttpMethod.GET, entity, SellerInfo[].class);

            SellerInfo[] arr = resp.getBody();
            return arr == null ? Collections.emptyList() : Arrays.asList(arr);
        } catch (Exception e) {
            return Collections.emptyList();
        }
    }

    public void approve(Long sellerId, String adminJwt) {
        callPut("/api/sellers/admin/" + sellerId + "/approve", adminJwt);
    }

    public void reject(Long sellerId, String adminJwt) {
        callPut("/api/sellers/admin/" + sellerId + "/reject", adminJwt);
    }

    public void block(Long sellerId, String adminJwt) {
        callPut("/api/sellers/admin/" + sellerId + "/block", adminJwt);
    }

    private void callPut(String path, String jwt) {
        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", "Bearer " + jwt);
        HttpEntity<Void> entity = new HttpEntity<>(headers);
        restTemplate.exchange(baseUrl + path, HttpMethod.PUT, entity, Void.class);
    }
}
