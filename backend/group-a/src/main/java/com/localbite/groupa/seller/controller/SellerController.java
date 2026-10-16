package com.localbite.groupa.seller.controller;

import com.localbite.groupa.seller.dto.*;
import com.localbite.groupa.seller.service.SellerLocationService;
import com.localbite.groupa.seller.service.SellerService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/sellers")
public class SellerController {

    private final SellerService sellerService;
    private final SellerLocationService locationService;

    public SellerController(SellerService sellerService,
                            SellerLocationService locationService) {
        this.sellerService = sellerService;
        this.locationService = locationService;
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of("status", "UP", "service", "seller-service"));
    }

    // ---- REGISTER ----

    @PostMapping("/register")
    public ResponseEntity<SellerResponse> register(Authentication auth,
                                                   @Valid @RequestBody RegisterSellerRequest req) {
        Long authUserId = (Long) auth.getCredentials();
        return ResponseEntity.ok(sellerService.register(authUserId, req));
    }

    // ---- READ ----

    @GetMapping("/me")
    public ResponseEntity<SellerResponse> mySeller(Authentication auth) {
        Long authUserId = (Long) auth.getCredentials();
        return ResponseEntity.ok(sellerService.getByAuthUserId(authUserId));
    }

    @GetMapping
    public ResponseEntity<List<SellerResponse>> list() {
        return ResponseEntity.ok(sellerService.listApproved());
    }

    // NEW: bulk endpoint for Location Service
    @GetMapping("/with-locations")
    public ResponseEntity<List<SellerWithLocationResponse>> listWithLocations() {
        return ResponseEntity.ok(sellerService.listApprovedWithLocations());
    }

    @GetMapping("/{sellerId}")
    public ResponseEntity<SellerResponse> getOne(@PathVariable Long sellerId) {
        return ResponseEntity.ok(sellerService.getById(sellerId));
    }

    // ---- UPDATE ----

    @PutMapping("/{sellerId}")
    public ResponseEntity<SellerResponse> update(Authentication auth,
                                                 @PathVariable Long sellerId,
                                                 @Valid @RequestBody UpdateSellerRequest req) {
        Long authUserId = (Long) auth.getCredentials();
        return ResponseEntity.ok(sellerService.update(sellerId, authUserId, req));
    }

    @PutMapping("/{sellerId}/operating-status")
    public ResponseEntity<SellerResponse> changeStatus(Authentication auth,
                                                       @PathVariable Long sellerId,
                                                       @Valid @RequestBody UpdateOperatingStatusRequest req) {
        Long authUserId = (Long) auth.getCredentials();
        return ResponseEntity.ok(
                sellerService.updateOperatingStatus(sellerId, authUserId, req.getOperatingStatus())
        );
    }

    // ---- LOCATION ----

    @GetMapping("/{sellerId}/location")
    public ResponseEntity<SellerLocationResponse> getLocation(@PathVariable Long sellerId) {
        return ResponseEntity.ok(locationService.get(sellerId));
    }

    @PostMapping("/{sellerId}/location")
    public ResponseEntity<SellerLocationResponse> setLocation(Authentication auth,
                                                              @PathVariable Long sellerId,
                                                              @Valid @RequestBody SellerLocationRequest req) {
        Long authUserId = (Long) auth.getCredentials();
        return ResponseEntity.ok(locationService.setLocation(sellerId, authUserId, req));
    }

    // ---- ADMIN ----

    @GetMapping("/admin/all")
    public ResponseEntity<List<SellerResponse>> adminListAll() {
        return ResponseEntity.ok(sellerService.listAll());
    }

    @PutMapping("/admin/{sellerId}/approve")
    public ResponseEntity<SellerResponse> approve(@PathVariable Long sellerId) {
        return ResponseEntity.ok(sellerService.approve(sellerId));
    }

    @PutMapping("/admin/{sellerId}/reject")
    public ResponseEntity<SellerResponse> reject(@PathVariable Long sellerId) {
        return ResponseEntity.ok(sellerService.reject(sellerId));
    }

    @PutMapping("/admin/{sellerId}/block")
    public ResponseEntity<SellerResponse> block(@PathVariable Long sellerId) {
        return ResponseEntity.ok(sellerService.block(sellerId));
    }
}