package com.localbite.groupc.commission.controller;

import com.localbite.groupc.commission.client.SellerClient;
import com.localbite.groupc.commission.dto.CommissionResponse;
import com.localbite.groupc.commission.dto.EarningsSummary;
import com.localbite.groupc.commission.dto.RecordCommissionRequest;
import com.localbite.groupc.commission.entity.CommissionStatus;
import com.localbite.groupc.commission.service.CommissionService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Map;

@RestController("commission_CommissionController")
@RequestMapping("/api/commissions")
public class CommissionController {

    private final CommissionService service;
    private final SellerClient sellerClient;

    public CommissionController(CommissionService service, SellerClient sellerClient) {
        this.service = service;
        this.sellerClient = sellerClient;
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of("status", "UP", "service", "commission-service"));
    }

    @PostMapping("/record")
    public ResponseEntity<CommissionResponse> record(@Valid @RequestBody RecordCommissionRequest req) {
        return ResponseEntity.ok(service.record(req));
    }

    @GetMapping("/order/{orderId}")
    public ResponseEntity<CommissionResponse> byOrder(@PathVariable Long orderId) {
        return ResponseEntity.ok(service.getByOrderId(orderId));
    }

    /**
     * Seller's own commissions.
     * Translates authUserId (from JWT) Ã¢â€ â€™ sellerId via Seller Service.
     */
    @GetMapping("/me")
    public ResponseEntity<List<CommissionResponse>> myCommissions(
            Authentication auth,
            @RequestHeader("Authorization") String bearer) {
        Long userId = (Long) auth.getCredentials();
        String jwt = bearer.replace("Bearer ", "");

        Long sellerId = sellerClient.getSellerIdByAuthUserId(userId, jwt);
        if (sellerId == null) return ResponseEntity.ok(Collections.emptyList());
        return ResponseEntity.ok(service.getBySeller(sellerId));
    }

    /**
     * Seller's own earnings summary.
     */
    @GetMapping("/me/summary")
    public ResponseEntity<EarningsSummary> mySummary(
            Authentication auth,
            @RequestHeader("Authorization") String bearer) {
        Long userId = (Long) auth.getCredentials();
        String jwt = bearer.replace("Bearer ", "");

        Long sellerId = sellerClient.getSellerIdByAuthUserId(userId, jwt);
        if (sellerId == null) {
            EarningsSummary empty = new EarningsSummary();
            empty.setSellerId(null);
            empty.setTotalEarnings(java.math.BigDecimal.ZERO);
            empty.setTotalCommission(java.math.BigDecimal.ZERO);
            empty.setGrossSales(java.math.BigDecimal.ZERO);
            return ResponseEntity.ok(empty);
        }
        return ResponseEntity.ok(service.sellerSummary(sellerId));
    }

    @GetMapping
    public ResponseEntity<List<CommissionResponse>> listAll() {
        return ResponseEntity.ok(service.listAll());
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<CommissionResponse>> byStatus(@PathVariable CommissionStatus status) {
        return ResponseEntity.ok(service.listByStatus(status));
    }

    @GetMapping("/seller/{sellerId}/summary")
    public ResponseEntity<EarningsSummary> sellerSummary(@PathVariable Long sellerId) {
        return ResponseEntity.ok(service.sellerSummary(sellerId));
    }

    @PutMapping("/{commissionId}/settle")
    public ResponseEntity<CommissionResponse> settle(@PathVariable Long commissionId) {
        return ResponseEntity.ok(service.settle(commissionId));
    }
}