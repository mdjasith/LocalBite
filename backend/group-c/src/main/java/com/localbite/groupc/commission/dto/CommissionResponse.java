package com.localbite.groupc.commission.dto;

import com.localbite.groupc.commission.entity.Commission;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class CommissionResponse {

    private Long commissionId;
    private Long orderId;
    private Long sellerId;
    private BigDecimal foodSubtotal;
    private BigDecimal commissionPercentage;
    private BigDecimal commissionAmount;
    private BigDecimal sellerAmount;
    private String commissionStatus;
    private LocalDateTime createdAt;
    private LocalDateTime settledAt;

    public static CommissionResponse from(Commission c) {
        CommissionResponse r = new CommissionResponse();
        r.commissionId = c.getCommissionId();
        r.orderId = c.getOrderId();
        r.sellerId = c.getSellerId();
        r.foodSubtotal = c.getFoodSubtotal();
        r.commissionPercentage = c.getCommissionPercentage();
        r.commissionAmount = c.getCommissionAmount();
        r.sellerAmount = c.getSellerAmount();
        r.commissionStatus = c.getCommissionStatus() != null ? c.getCommissionStatus().name() : null;
        r.createdAt = c.getCreatedAt();
        r.settledAt = c.getSettledAt();
        return r;
    }

    public Long getCommissionId() { return commissionId; }
    public Long getOrderId() { return orderId; }
    public Long getSellerId() { return sellerId; }
    public BigDecimal getFoodSubtotal() { return foodSubtotal; }
    public BigDecimal getCommissionPercentage() { return commissionPercentage; }
    public BigDecimal getCommissionAmount() { return commissionAmount; }
    public BigDecimal getSellerAmount() { return sellerAmount; }
    public String getCommissionStatus() { return commissionStatus; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getSettledAt() { return settledAt; }
}
