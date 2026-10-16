package com.localbite.groupc.payment.client;

import com.localbite.groupc.payment.dto.WalletTransferRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;

@Component("payment_WalletClient")
public class WalletClient {

    private final RestTemplate restTemplate;

    @Value("${services.wallet.url}")
    private String walletServiceUrl;

    public WalletClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public void debitCustomer(Long customerId, BigDecimal amount,
                              String refType, Long refId, String token) {
        post("/api/wallets/debit", customerId, "CUSTOMER", amount, refType, refId,
                "Payment for order " + refId, token);
    }

    public void creditSeller(Long sellerId, BigDecimal amount,
                             String refType, Long refId, String token) {
        post("/api/wallets/credit", sellerId, "SELLER", amount, refType, refId,
                "Earning for order " + refId, token);
    }

    public void creditPlatformCommission(BigDecimal amount,
                                         String refType, Long refId, String token) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + token);

            WalletTransferRequest req = new WalletTransferRequest();
            // REQUIRED: The wallet service validates these fields.
            // The credit-commission endpoint ignores the values but needs them present.
            req.setUserId(0L);
            req.setWalletType("PLATFORM");
            req.setAmount(amount);
            req.setReferenceType(refType);
            req.setReferenceId(refId);
            req.setDescription("Platform commission for order " + refId);

            HttpEntity<WalletTransferRequest> entity = new HttpEntity<>(req, headers);
            restTemplate.postForEntity(
                    walletServiceUrl + "/api/wallets/credit-commission",
                    entity,
                    Void.class
            );
        } catch (Exception e) {
            throw new RuntimeException("Platform commission credit failed: " + e.getMessage());
        }
    }

    private void post(String path, Long userId, String walletType,
                      BigDecimal amount, String refType, Long refId,
                      String desc, String token) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("Authorization", "Bearer " + token);

            WalletTransferRequest req = new WalletTransferRequest();
            req.setUserId(userId);
            req.setWalletType(walletType);
            req.setAmount(amount);
            req.setReferenceType(refType);
            req.setReferenceId(refId);
            req.setDescription(desc);

            HttpEntity<WalletTransferRequest> entity = new HttpEntity<>(req, headers);
            restTemplate.postForEntity(
                    walletServiceUrl + path,
                    entity,
                    Void.class
            );
        } catch (Exception e) {
            throw new RuntimeException("Wallet call failed: " + e.getMessage());
        }
    }
}