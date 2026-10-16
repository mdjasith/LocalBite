package com.localbite.groupc.wallet.service;

import com.localbite.groupc.wallet.dto.CreditDebitRequest;
import com.localbite.groupc.wallet.dto.TransactionResponse;
import com.localbite.groupc.wallet.dto.WalletResponse;
import com.localbite.groupc.wallet.entity.*;
import com.localbite.groupc.wallet.repository.WalletRepository;
import com.localbite.groupc.wallet.repository.WalletTransactionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service("wallet_WalletService")
public class WalletService {

    private final WalletRepository walletRepo;
    private final WalletTransactionRepository txRepo;

    public WalletService(WalletRepository walletRepo, WalletTransactionRepository txRepo) {
        this.walletRepo = walletRepo;
        this.txRepo = txRepo;
    }

    public WalletResponse getMyWallet(Long userId, WalletType type) {
        Wallet w = walletRepo.findByUserIdAndWalletType(userId, type)
                .orElseThrow(() -> new RuntimeException("Wallet not found"));
        return WalletResponse.from(w);
    }

    public WalletResponse getWallet(Long userId, WalletType type) {
        Wallet w = walletRepo.findByUserIdAndWalletType(userId, type)
                .orElseThrow(() -> new RuntimeException("Wallet not found"));
        return WalletResponse.from(w);
    }

    public List<TransactionResponse> listTransactions(Long walletId) {
        walletRepo.findById(walletId)
                .orElseThrow(() -> new RuntimeException("Wallet not found"));
        return txRepo.findByWalletIdOrderByCreatedAtDesc(walletId).stream()
                .map(TransactionResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional
    public WalletResponse createWallet(Long userId, WalletType type) {
        if (walletRepo.existsByUserIdAndWalletType(userId, type)) {
            throw new RuntimeException("Wallet already exists");
        }
        Wallet w = new Wallet();
        w.setUserId(userId);
        w.setWalletType(type);
        w.setBalance(BigDecimal.ZERO);
        w.setCurrency("INR");
        w.setWalletStatus(WalletStatus.ACTIVE);
        return WalletResponse.from(walletRepo.save(w));
    }

    @Transactional
    public WalletResponse credit(CreditDebitRequest req) {
        Wallet w = getOrCreate(req.getUserId(), req.getWalletType());
        if (w.getWalletStatus() != WalletStatus.ACTIVE) {
            throw new RuntimeException("Wallet is not active");
        }

        BigDecimal before = w.getBalance();
        BigDecimal after = before.add(req.getAmount());

        w.setBalance(after);
        walletRepo.save(w);

        record(w, TransactionType.CREDIT, req.getAmount(), before, after,
                req.getReferenceType(), req.getReferenceId(),
                req.getDescription() != null ? req.getDescription() : "Credit");

        return WalletResponse.from(w);
    }

    @Transactional
    public WalletResponse debit(CreditDebitRequest req) {
        Wallet w = getOrCreate(req.getUserId(), req.getWalletType());
        if (w.getWalletStatus() != WalletStatus.ACTIVE) {
            throw new RuntimeException("Wallet is not active");
        }

        BigDecimal before = w.getBalance();
        if (before.compareTo(req.getAmount()) < 0) {
            throw new RuntimeException("Insufficient balance");
        }
        BigDecimal after = before.subtract(req.getAmount());

        w.setBalance(after);
        walletRepo.save(w);

        record(w, TransactionType.DEBIT, req.getAmount(), before, after,
                req.getReferenceType(), req.getReferenceId(),
                req.getDescription() != null ? req.getDescription() : "Debit");

        return WalletResponse.from(w);
    }

    @Transactional
    public WalletResponse creditCommission(CreditDebitRequest req) {
        // For platform wallet: user_id = 0
        Wallet w = getOrCreate(0L, WalletType.PLATFORM);
        BigDecimal before = w.getBalance();
        BigDecimal after = before.add(req.getAmount());

        w.setBalance(after);
        walletRepo.save(w);

        record(w, TransactionType.COMMISSION, req.getAmount(), before, after,
                req.getReferenceType(), req.getReferenceId(),
                req.getDescription() != null ? req.getDescription() : "Platform commission");

        return WalletResponse.from(w);
    }

    private Wallet getOrCreate(Long userId, WalletType type) {
        return walletRepo.findByUserIdAndWalletType(userId, type).orElseGet(() -> {
            Wallet w = new Wallet();
            w.setUserId(userId);
            w.setWalletType(type);
            w.setBalance(BigDecimal.ZERO);
            w.setCurrency("INR");
            w.setWalletStatus(WalletStatus.ACTIVE);
            return walletRepo.save(w);
        });
    }

    private void record(Wallet w, TransactionType type, BigDecimal amount,
                        BigDecimal before, BigDecimal after,
                        String refType, Long refId, String desc) {
        WalletTransaction t = new WalletTransaction();
        t.setWalletId(w.getWalletId());
        t.setTransactionType(type);
        t.setAmount(amount);
        t.setBalanceBefore(before);
        t.setBalanceAfter(after);
        t.setReferenceType(refType);
        t.setReferenceId(refId);
        t.setDescription(desc);
        txRepo.save(t);
    }
}
