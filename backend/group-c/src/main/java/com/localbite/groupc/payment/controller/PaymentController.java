package com.localbite.groupc.payment.controller;

import com.localbite.groupc.payment.dto.PaymentResponse;
import com.localbite.groupc.payment.dto.ProcessPaymentRequest;
import com.localbite.groupc.payment.service.PaymentService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController("payment_PaymentController")
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService service;

    public PaymentController(PaymentService service) {
        this.service = service;
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of("status", "UP", "service", "payment-service"));
    }

    @PostMapping("/process")
    public ResponseEntity<PaymentResponse> process(
            Authentication auth,
            @RequestHeader("Authorization") String bearer,
            @Valid @RequestBody ProcessPaymentRequest req) {
        String jwt = bearer.replace("Bearer ", "");
        Long callerId = (Long) auth.getCredentials();
        if (!callerId.equals(req.getCustomerId())) {
            throw new RuntimeException("You can only pay for your own orders");
        }
        return ResponseEntity.ok(service.process(req, jwt));
    }

    @GetMapping("/me")
    public ResponseEntity<List<PaymentResponse>> myPayments(Authentication auth) {
        Long userId = (Long) auth.getCredentials();
        return ResponseEntity.ok(service.getByCustomer(userId));
    }

    @GetMapping("/order/{orderId}")
    public ResponseEntity<PaymentResponse> byOrder(@PathVariable Long orderId) {
        return ResponseEntity.ok(service.getByOrderId(orderId));
    }

    @GetMapping
    public ResponseEntity<List<PaymentResponse>> listAll() {
        return ResponseEntity.ok(service.listAll());
    }

    @PutMapping("/{paymentId}/refund")
    public ResponseEntity<PaymentResponse> refund(@PathVariable Long paymentId) {
        return ResponseEntity.ok(service.refund(paymentId));
    }

    /** Called by order-service when an order is cancelled. */
    @PutMapping("/order/{orderId}/refund")
    public ResponseEntity<PaymentResponse> refundByOrder(@PathVariable Long orderId) {
        return ResponseEntity.ok(service.refundByOrderId(orderId));
    }
}