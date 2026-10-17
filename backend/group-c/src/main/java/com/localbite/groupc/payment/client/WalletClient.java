package com.localbite.groupc.payment.client;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.Map;

@Component
public class WalletClient {

    private final RestTemplate restTemplate;

    @Value("${services.wallet.url}")
    private String walletServiceUrl;

    public WalletClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public void debitCustomer(Long userId, BigDecimal amount, String refType, Long refId, String jwtToken) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            if (jwtToken != null && !jwtToken.isBlank()) headers.set("Authorization", "Bearer " + jwtToken);
            Map<String, Object> body = Map.of("userId", userId, "walletType", "CUSTOMER", "amount", amount, "referenceType", refType, "referenceId", refId);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
            restTemplate.postForEntity(walletServiceUrl + "/api/wallets/debit", entity, Object.class);
        } catch (Exception e) {
            throw new RuntimeException("Wallet debit failed: " + e.getMessage());
        }
    }

    public void creditSeller(Long userId, BigDecimal amount, String refType, Long refId, String jwtToken) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            if (jwtToken != null && !jwtToken.isBlank()) headers.set("Authorization", "Bearer " + jwtToken);
            Map<String, Object> body = Map.of("userId", userId, "walletType", "SELLER", "amount", amount, "referenceType", refType, "referenceId", refId);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
            restTemplate.postForEntity(walletServiceUrl + "/api/wallets/credit", entity, Object.class);
        } catch (Exception e) {
            throw new RuntimeException("Wallet seller credit failed: " + e.getMessage());
        }
    }

    public void creditPlatformCommission(BigDecimal amount, String refType, Long refId, String jwtToken) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            if (jwtToken != null && !jwtToken.isBlank()) headers.set("Authorization", "Bearer " + jwtToken);
            Map<String, Object> body = Map.of("userId", 0L, "walletType", "PLATFORM", "amount", amount, "referenceType", refType, "referenceId", refId);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
            restTemplate.postForEntity(walletServiceUrl + "/api/wallets/credit", entity, Object.class);
        } catch (Exception e) {
            throw new RuntimeException("Wallet commission credit failed: " + e.getMessage());
        }
    }

    public void creditCustomer(Long userId, BigDecimal amount, String refType, Long refId, String jwtToken) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            if (jwtToken != null && !jwtToken.isBlank()) headers.set("Authorization", "Bearer " + jwtToken);
            Map<String, Object> body = Map.of("userId", userId, "walletType", "CUSTOMER", "amount", amount, "referenceType", refType, "referenceId", refId);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);
            restTemplate.postForEntity(walletServiceUrl + "/api/wallets/credit", entity, Object.class);
        } catch (Exception e) {
            System.err.println("Refund to customer failed: " + e.getMessage());
        }
    }
}