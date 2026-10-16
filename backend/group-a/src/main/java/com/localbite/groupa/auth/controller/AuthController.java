package com.localbite.groupa.auth.controller;

import com.localbite.groupa.auth.dto.AuthResponse;
import com.localbite.groupa.auth.dto.LoginRequest;
import com.localbite.groupa.auth.dto.RegisterRequest;
import com.localbite.groupa.auth.entity.AuthUser;
import com.localbite.groupa.auth.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of("status", "UP", "service", "auth-service"));
    }

    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> me(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Unauthorized"));
        }
        return ResponseEntity.ok(Map.of(
                "email", authentication.getName(),
                "authorities", authentication.getAuthorities()
        ));
    }

    /* ======================= ADMIN ======================= */

    @GetMapping("/admin/users")
    public ResponseEntity<List<AuthUser>> adminListUsers() {
        return ResponseEntity.ok(authService.listAllUsers());
    }

    @PutMapping("/admin/users/{id}")
    public ResponseEntity<AuthUser> adminUpdateUser(@PathVariable Long id,
                                                    @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(authService.adminUpdateUser(id, body));
    }

    @DeleteMapping("/admin/users/{id}")
    public ResponseEntity<Map<String, String>> adminDeleteUser(@PathVariable Long id) {
        authService.adminDeleteUser(id);
        return ResponseEntity.ok(Map.of("message", "User deleted"));
    }
}