package com.localbite.groupb.cart.controller;

import com.localbite.groupb.cart.dto.*;
import com.localbite.groupb.cart.service.CartService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController("cart_CartController")
@RequestMapping("/api/carts")
public class CartController {

    private final CartService service;

    public CartController(CartService service) {
        this.service = service;
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of("status", "UP", "service", "cart-service"));
    }

    @GetMapping("/me")
    public ResponseEntity<CartResponse> myCart(Authentication auth) {
        Long userId = (Long) auth.getCredentials();
        return ResponseEntity.ok(service.view(userId));
    }

    @PostMapping("/me/items")
    public ResponseEntity<CartResponse> addItem(Authentication auth,
                                                @Valid @RequestBody AddCartItemRequest req) {
        Long userId = (Long) auth.getCredentials();
        return ResponseEntity.ok(service.addItem(userId, req));
    }

    @PutMapping("/me/items/{cartItemId}")
    public ResponseEntity<CartResponse> updateQuantity(Authentication auth,
                                                       @PathVariable Long cartItemId,
                                                       @Valid @RequestBody UpdateQuantityRequest req) {
        Long userId = (Long) auth.getCredentials();
        return ResponseEntity.ok(service.updateQuantity(userId, cartItemId, req.getQuantity()));
    }

    @DeleteMapping("/me/items/{cartItemId}")
    public ResponseEntity<CartResponse> removeItem(Authentication auth,
                                                   @PathVariable Long cartItemId) {
        Long userId = (Long) auth.getCredentials();
        return ResponseEntity.ok(service.removeItem(userId, cartItemId));
    }

    @DeleteMapping("/me")
    public ResponseEntity<CartResponse> clearCart(Authentication auth) {
        Long userId = (Long) auth.getCredentials();
        return ResponseEntity.ok(service.clearCart(userId));
    }
}
