package com.localbite.groupa.user.controller;

import com.localbite.groupa.user.dto.*;
import com.localbite.groupa.user.service.UserAddressService;
import com.localbite.groupa.user.service.UserProfileService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserProfileService profileService;
    private final UserAddressService addressService;

    public UserController(UserProfileService profileService,
                          UserAddressService addressService) {
        this.profileService = profileService;
        this.addressService = addressService;
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of("status", "UP", "service", "user-service"));
    }

    @GetMapping("/me")
    public ResponseEntity<UserProfileResponse> myProfile(Authentication auth) {
        Long userId = (Long) auth.getCredentials();
        return ResponseEntity.ok(profileService.get(userId));
    }

    @GetMapping("/{userId}")
    public ResponseEntity<UserProfileResponse> getProfile(@PathVariable Long userId) {
        return ResponseEntity.ok(profileService.get(userId));
    }

    @PostMapping("/{userId}")
    public ResponseEntity<UserProfileResponse> createProfile(
            @PathVariable Long userId,
            @Valid @RequestBody CreateProfileRequest req) {
        return ResponseEntity.ok(profileService.create(userId, req));
    }

    @PutMapping("/{userId}")
    public ResponseEntity<UserProfileResponse> updateProfile(
            @PathVariable Long userId,
            @Valid @RequestBody UpdateProfileRequest req) {
        return ResponseEntity.ok(profileService.update(userId, req));
    }

    @GetMapping("/{userId}/addresses")
    public ResponseEntity<List<AddressResponse>> listAddresses(@PathVariable Long userId) {
        return ResponseEntity.ok(addressService.listByUser(userId));
    }

    @PostMapping("/{userId}/addresses")
    public ResponseEntity<AddressResponse> addAddress(
            @PathVariable Long userId,
            @Valid @RequestBody AddressRequest req) {
        return ResponseEntity.ok(addressService.add(userId, req));
    }

    @PutMapping("/{userId}/addresses/{addressId}")
    public ResponseEntity<AddressResponse> updateAddress(
            @PathVariable Long userId,
            @PathVariable Long addressId,
            @Valid @RequestBody AddressRequest req) {
        return ResponseEntity.ok(addressService.update(userId, addressId, req));
    }

    @DeleteMapping("/{userId}/addresses/{addressId}")
    public ResponseEntity<Map<String, String>> deleteAddress(
            @PathVariable Long userId,
            @PathVariable Long addressId) {
        addressService.delete(userId, addressId);
        return ResponseEntity.ok(Map.of("message", "Address deleted"));
    }
}
