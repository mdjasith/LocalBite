package com.localbite.groupb.order.controller;

import com.localbite.groupb.order.client.SellerClient;
import com.localbite.groupb.order.dto.OrderResponse;
import com.localbite.groupb.order.dto.PlaceOrderRequest;
import com.localbite.groupb.order.dto.UpdateStatusRequest;
import com.localbite.groupb.order.dto.VerifyDeliveryRequest;
import com.localbite.groupb.order.service.OrderService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService service;
    private final SellerClient sellerClient;

    public OrderController(OrderService service, SellerClient sellerClient) {
        this.service = service;
        this.sellerClient = sellerClient;
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of("status", "UP", "service", "order-service"));
    }

    @PostMapping("/place")
    public ResponseEntity<List<OrderResponse>> place(Authentication auth, @RequestHeader("Authorization") String bearer, @Valid @RequestBody PlaceOrderRequest req) {
        Long userId = (Long) auth.getCredentials();
        String jwt = bearer.replace("Bearer ", "");
        return ResponseEntity.ok(service.placeOrders(userId, jwt, req));
    }

    @GetMapping("/me")
    public ResponseEntity<List<OrderResponse>> myOrders(Authentication auth, @RequestHeader("Authorization") String bearer) {
        Long userId = (Long) auth.getCredentials();
        String role = auth.getAuthorities().iterator().next().getAuthority();

        if ("ROLE_CUSTOMER".equals(role)) {
            return ResponseEntity.ok(service.getCustomerOrders(userId));
        }

        if ("ROLE_SELLER".equals(role)) {
            String jwt = bearer.replace("Bearer ", "");
            Long sellerId = sellerClient.getSellerIdByAuthUserId(userId, jwt);
            if (sellerId == null) return ResponseEntity.ok(Collections.emptyList());
            
            // Filter out PENDING_PAYMENT orders so sellers don't see unpaid orders
            List<OrderResponse> paidOrders = service.getSellerOrders(sellerId).stream()
                .filter(o -> !"PENDING_PAYMENT".equals(o.getOrderStatus()))
                .collect(Collectors.toList());
                
            return ResponseEntity.ok(paidOrders);
        }

        return ResponseEntity.badRequest().build();
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<OrderResponse> getOne(Authentication auth, @RequestHeader("Authorization") String bearer, @PathVariable Long orderId) {
        Long userId = (Long) auth.getCredentials();
        String role = auth.getAuthorities().iterator().next().getAuthority().replace("ROLE_", "");
        String jwt = bearer.replace("Bearer ", "");
        return ResponseEntity.ok(service.getById(orderId, userId, role, jwt));
    }

    @PutMapping("/{orderId}/status")
    public ResponseEntity<OrderResponse> updateStatus(Authentication auth, @RequestHeader("Authorization") String bearer, @PathVariable Long orderId, @Valid @RequestBody UpdateStatusRequest req) {
        Long userId = (Long) auth.getCredentials();
        String role = auth.getAuthorities().iterator().next().getAuthority().replace("ROLE_", "");
        String jwt = bearer.replace("Bearer ", "");
        return ResponseEntity.ok(service.updateStatus(orderId, userId, role, req.getStatus(), jwt));
    }

    @GetMapping("/{orderId}/view-otp")
    public ResponseEntity<Map<String, Object>> viewOtp(Authentication auth, @RequestHeader("Authorization") String bearer, @PathVariable Long orderId) {
        Long userId = (Long) auth.getCredentials();
        String role = auth.getAuthorities().iterator().next().getAuthority().replace("ROLE_", "");
        String jwt = bearer.replace("Bearer ", "");
        return ResponseEntity.ok(service.viewOtp(orderId, userId, role, jwt));
    }

    @PostMapping("/{orderId}/verify-delivery")
    public ResponseEntity<OrderResponse> verifyDelivery(Authentication auth, @RequestHeader("Authorization") String bearer, @PathVariable Long orderId, @Valid @RequestBody VerifyDeliveryRequest req) {
        Long userId = (Long) auth.getCredentials();
        String role = auth.getAuthorities().iterator().next().getAuthority().replace("ROLE_", "");
        String jwt = bearer.replace("Bearer ", "");
        return ResponseEntity.ok(service.verifyDelivery(orderId, userId, role, req.getOtp(), jwt));
    }

    @PutMapping("/{orderId}/cancel")
    public ResponseEntity<OrderResponse> cancel(Authentication auth, @PathVariable Long orderId) {
        Long userId = (Long) auth.getCredentials();
        String role = auth.getAuthorities().iterator().next().getAuthority().replace("ROLE_", "");
        return ResponseEntity.ok(service.cancel(orderId, userId, role));
    }

    @PutMapping("/{orderId}/mark-paid")
    public ResponseEntity<OrderResponse> markPaid(@PathVariable Long orderId) {
        return ResponseEntity.ok(service.markPaid(orderId));
    }

    @GetMapping("/admin/all")
    public ResponseEntity<List<OrderResponse>> adminListAll() {
        return ResponseEntity.ok(service.listAllOrders());
    }

    @PutMapping("/admin/{orderId}/cancel")
    public ResponseEntity<OrderResponse> adminCancel(@PathVariable Long orderId) {
        return ResponseEntity.ok(service.adminCancel(orderId));
    }

    @PutMapping("/admin/{orderId}/deliver")
    public ResponseEntity<OrderResponse> adminForceDeliver(@RequestHeader("Authorization") String bearer, @PathVariable Long orderId) {
        String jwt = bearer.replace("Bearer ", "");
        return ResponseEntity.ok(service.adminForceDeliver(orderId, jwt));
    }
}