package com.localbite.groupc.wallet.dto;

import com.localbite.groupc.wallet.entity.WalletTransaction;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class TransactionResponse {

    private Long transactionId;
    private Long walletId;
    private String transactionType;
    private BigDecimal amount;
    private BigDecimal balanceBefore;
    private BigDecimal balanceAfter;
    private String referenceType;
    private Long referenceId;
    private String description;
    private LocalDateTime createdAt;

    public static TransactionResponse from(WalletTransaction t) {
        TransactionResponse r = new TransactionResponse();
        r.transactionId = t.getTransactionId();
        r.walletId = t.getWalletId();
        r.transactionType = t.getTransactionType().name();
        r.amount = t.getAmount();
        r.balanceBefore = t.getBalanceBefore();
        r.balanceAfter = t.getBalanceAfter();
        r.referenceType = t.getReferenceType();
        r.referenceId = t.getReferenceId();
        r.description = t.getDescription();
        r.createdAt = t.getCreatedAt();
        return r;
    }

    public Long getTransactionId() { return transactionId; }
    public Long getWalletId() { return walletId; }
    public String getTransactionType() { return transactionType; }
    public BigDecimal getAmount() { return amount; }
    public BigDecimal getBalanceBefore() { return balanceBefore; }
    public BigDecimal getBalanceAfter() { return balanceAfter; }
    public String getReferenceType() { return referenceType; }
    public Long getReferenceId() { return referenceId; }
    public String getDescription() { return description; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
