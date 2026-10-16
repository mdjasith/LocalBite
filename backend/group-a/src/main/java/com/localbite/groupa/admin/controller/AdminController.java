package com.localbite.groupa.admin.controller;

import com.localbite.groupa.admin.client.SellerClient;
import com.localbite.groupa.admin.dto.DashboardStats;
import com.localbite.groupa.admin.dto.PaymentInfo;
import com.localbite.groupa.admin.dto.SellerInfo;
import com.localbite.groupa.admin.client.PaymentClient;
import com.localbite.groupa.admin.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final DashboardService dashboardService;
    private final SellerClient sellerClient;
    private final PaymentClient paymentClient;

    public AdminController(DashboardService dashboardService,
                           SellerClient sellerClient,
                           PaymentClient paymentClient) {
        this.dashboardService = dashboardService;
        this.sellerClient = sellerClient;
        this.paymentClient = paymentClient;
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of("status", "UP", "service", "admin-service"));
    }

    @GetMapping("/dashboard")
    public ResponseEntity<DashboardStats> dashboard(@RequestHeader("Authorization") String bearer) {
        String jwt = bearer.replace("Bearer ", "");
        return ResponseEntity.ok(dashboardService.buildStats(jwt));
    }

    @GetMapping("/sellers")
    public ResponseEntity<List<SellerInfo>> allSellers(@RequestHeader("Authorization") String bearer) {
        return ResponseEntity.ok(sellerClient.listAllSellers(bearer.replace("Bearer ", "")));
    }

    @GetMapping("/payments")
    public ResponseEntity<List<PaymentInfo>> allPayments(@RequestHeader("Authorization") String bearer) {
        return ResponseEntity.ok(paymentClient.listAllPayments(bearer.replace("Bearer ", "")));
    }

    @PutMapping("/sellers/{sellerId}/approve")
    public ResponseEntity<Map<String, String>> approve(@PathVariable Long sellerId,
                                                       @RequestHeader("Authorization") String bearer) {
        sellerClient.approve(sellerId, bearer.replace("Bearer ", ""));
        return ResponseEntity.ok(Map.of("message", "Seller approved"));
    }

    @PutMapping("/sellers/{sellerId}/reject")
    public ResponseEntity<Map<String, String>> reject(@PathVariable Long sellerId,
                                                      @RequestHeader("Authorization") String bearer) {
        sellerClient.reject(sellerId, bearer.replace("Bearer ", ""));
        return ResponseEntity.ok(Map.of("message", "Seller rejected"));
    }

    @PutMapping("/sellers/{sellerId}/block")
    public ResponseEntity<Map<String, String>> block(@PathVariable Long sellerId,
                                                     @RequestHeader("Authorization") String bearer) {
        sellerClient.block(sellerId, bearer.replace("Bearer ", ""));
        return ResponseEntity.ok(Map.of("message", "Seller blocked"));
    }
}
