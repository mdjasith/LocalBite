package com.localbite.groupa.auth.service;

import com.localbite.groupa.auth.dto.AuthResponse;
import com.localbite.groupa.auth.dto.LoginRequest;
import com.localbite.groupa.auth.dto.RegisterRequest;
import com.localbite.groupa.auth.entity.AccountStatus;
import com.localbite.groupa.auth.entity.AuthUser;
import com.localbite.groupa.auth.entity.Role;
import com.localbite.groupa.auth.repository.AuthUserRepository;
import com.localbite.groupa.auth.security.JwtService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
public class AuthService {

    private final AuthUserRepository authUserRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(AuthUserRepository authUserRepository,
                       PasswordEncoder passwordEncoder,
                       JwtService jwtService) {
        this.authUserRepository = authUserRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (authUserRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }
        AuthUser user = new AuthUser();
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole());
        user.setAccountStatus(AccountStatus.ACTIVE);

        AuthUser saved = authUserRepository.save(user);
        String token = jwtService.generateToken(saved);
        return new AuthResponse(
                token, saved.getEmail(), saved.getRole().name(),
                saved.getAuthUserId(), "Registration successful"
        );
    }

    public AuthResponse login(LoginRequest request) {
        AuthUser user = authUserRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));
        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Invalid email or password");
        }
        if (user.getAccountStatus() != AccountStatus.ACTIVE) {
            throw new RuntimeException("Account is " + user.getAccountStatus());
        }
        String token = jwtService.generateToken(user);
        return new AuthResponse(
                token, user.getEmail(), user.getRole().name(),
                user.getAuthUserId(), "Login successful"
        );
    }

    public List<AuthUser> listAllUsers() {
        return authUserRepository.findAll();
    }

    @Transactional
    public AuthUser adminUpdateUser(Long id, Map<String, String> body) {
        AuthUser u = authUserRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (body.containsKey("role") && body.get("role") != null) {
            u.setRole(Role.valueOf(body.get("role")));
        }
        if (body.containsKey("accountStatus") && body.get("accountStatus") != null) {
            u.setAccountStatus(AccountStatus.valueOf(body.get("accountStatus")));
        }
        if (body.containsKey("password") && body.get("password") != null
                && !body.get("password").isBlank()) {
            u.setPasswordHash(passwordEncoder.encode(body.get("password")));
        }
        return authUserRepository.save(u);
    }

    @Transactional
    public void adminDeleteUser(Long id) {
        if (!authUserRepository.existsById(id)) {
            throw new RuntimeException("User not found");
        }
        authUserRepository.deleteById(id);
    }
}