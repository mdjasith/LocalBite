package com.localbite.groupd.delivery.controller;

import com.localbite.groupd.delivery.dto.*;
import com.localbite.groupd.delivery.entity.DeliveryStatus;
import com.localbite.groupd.delivery.service.DeliveryService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController("delivery_DeliveryController")
@RequestMapping("/api/deliveries")
public class DeliveryController {

    private final DeliveryService service;

    public DeliveryController(DeliveryService service) {
        this.service = service;
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of("status", "UP", "service", "delivery-service"));
    }

    @PostMapping("/create")
    public ResponseEntity<DeliveryResponse> create(@Valid @RequestBody CreateDeliveryRequest req) {
        return ResponseEntity.ok(service.create(req));
    }

    @GetMapping("/order/{orderId}")
    public ResponseEntity<DeliveryResponse> getByOrder(@PathVariable Long orderId) {
        return ResponseEntity.ok(service.getByOrderId(orderId));
    }

    @PutMapping("/order/{orderId}/assign")
    public ResponseEntity<DeliveryResponse> assign(@PathVariable Long orderId,
                                                    @Valid @RequestBody AssignDeliveryRequest req) {
        return ResponseEntity.ok(service.assign(orderId, req));
    }

    @PutMapping("/order/{orderId}/status")
    public ResponseEntity<DeliveryResponse> updateStatus(@PathVariable Long orderId,
                                                          @Valid @RequestBody UpdateDeliveryStatusRequest req) {
        return ResponseEntity.ok(service.updateStatus(orderId, req.getStatus()));
    }

    @PostMapping("/order/{orderId}/generate-otp")
    public ResponseEntity<OtpResponse> generateOtp(@PathVariable Long orderId) {
        return ResponseEntity.ok(service.generateOtp(orderId));
    }

    @GetMapping("/order/{orderId}/view-otp")
    public ResponseEntity<OtpResponse> viewOtp(@PathVariable Long orderId) {
        return ResponseEntity.ok(service.viewOtp(orderId));
    }

    @PostMapping("/order/{orderId}/verify-otp")
    public ResponseEntity<DeliveryResponse> verifyOtp(@PathVariable Long orderId,
                                                      @Valid @RequestBody VerifyOtpRequest req) {
        return ResponseEntity.ok(service.verifyOtp(orderId, req));
    }

    @GetMapping
    public ResponseEntity<List<DeliveryResponse>> listAll() {
        return ResponseEntity.ok(service.listAll());
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<DeliveryResponse>> listByStatus(@PathVariable DeliveryStatus status) {
        return ResponseEntity.ok(service.listByStatus(status));
    }
}