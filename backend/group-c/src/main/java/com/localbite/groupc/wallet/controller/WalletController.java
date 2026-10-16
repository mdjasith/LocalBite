package com.localbite.groupc.wallet.controller;

import com.localbite.groupc.wallet.dto.CreditDebitRequest;
import com.localbite.groupc.wallet.dto.TransactionResponse;
import com.localbite.groupc.wallet.dto.WalletResponse;
import com.localbite.groupc.wallet.entity.WalletType;
import com.localbite.groupc.wallet.service.WalletService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController("wallet_WalletController")
@RequestMapping("/api/wallets")
public class WalletController {

    private final WalletService service;

    public WalletController(WalletService service) {
        this.service = service;
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of("status", "UP", "service", "wallet-service"));
    }

    // ---- CUSTOMER: my wallet ----
    @GetMapping("/me")
    public ResponseEntity<WalletResponse> myWallet(Authentication auth) {
        Long userId = (Long) auth.getCredentials();
        String role = auth.getAuthorities().iterator().next().getAuthority().replace("ROLE_", "");
        WalletType type = switch (role) {
            case "SELLER" -> WalletType.SELLER;
            case "ADMIN" -> WalletType.PLATFORM;
            default -> WalletType.CUSTOMER;
        };
        return ResponseEntity.ok(service.getMyWallet(userId, type));
    }

    @GetMapping("/me/transactions")
    public ResponseEntity<List<TransactionResponse>> myTransactions(Authentication auth) {
        Long userId = (Long) auth.getCredentials();
        String role = auth.getAuthorities().iterator().next().getAuthority().replace("ROLE_", "");
        WalletType type = switch (role) {
            case "SELLER" -> WalletType.SELLER;
            case "ADMIN" -> WalletType.PLATFORM;
            default -> WalletType.CUSTOMER;
        };
        WalletResponse w = service.getMyWallet(userId, type);
        return ResponseEntity.ok(service.listTransactions(w.getWalletId()));
    }

    // ---- INTERNAL: used by Payment Service ----
    @PostMapping("/credit")
    public ResponseEntity<WalletResponse> credit(@Valid @RequestBody CreditDebitRequest req) {
        return ResponseEntity.ok(service.credit(req));
    }

    @PostMapping("/debit")
    public ResponseEntity<WalletResponse> debit(@Valid @RequestBody CreditDebitRequest req) {
        return ResponseEntity.ok(service.debit(req));
    }

    @PostMapping("/credit-commission")
    public ResponseEntity<WalletResponse> creditCommission(@Valid @RequestBody CreditDebitRequest req) {
        return ResponseEntity.ok(service.creditCommission(req));
    }

    // ---- ADMIN: create wallet manually ----
    @PostMapping("/create")
    public ResponseEntity<WalletResponse> create(@RequestParam Long userId,
                                                 @RequestParam WalletType walletType) {
        return ResponseEntity.ok(service.createWallet(userId, walletType));
    }

    @GetMapping("/{userId}")
    public ResponseEntity<WalletResponse> get(@PathVariable Long userId,
                                              @RequestParam WalletType walletType) {
        return ResponseEntity.ok(service.getWallet(userId, walletType));
    }

    @GetMapping("/{walletId}/transactions")
    public ResponseEntity<List<TransactionResponse>> transactions(@PathVariable Long walletId) {
        return ResponseEntity.ok(service.listTransactions(walletId));
    }
}
