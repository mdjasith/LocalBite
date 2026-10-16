package com.localbite.groupc.wallet.dto;

import com.localbite.groupc.wallet.entity.Wallet;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class WalletResponse {

    private Long walletId;
    private Long userId;
    private String walletType;
    private BigDecimal balance;
    private String currency;
    private String walletStatus;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static WalletResponse from(Wallet w) {
        WalletResponse r = new WalletResponse();
        r.walletId = w.getWalletId();
        r.userId = w.getUserId();
        r.walletType = w.getWalletType().name();
        r.balance = w.getBalance();
        r.currency = w.getCurrency();
        r.walletStatus = w.getWalletStatus() != null ? w.getWalletStatus().name() : null;
        r.createdAt = w.getCreatedAt();
        r.updatedAt = w.getUpdatedAt();
        return r;
    }

    public Long getWalletId() { return walletId; }
    public Long getUserId() { return userId; }
    public String getWalletType() { return walletType; }
    public BigDecimal getBalance() { return balance; }
    public String getCurrency() { return currency; }
    public String getWalletStatus() { return walletStatus; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
