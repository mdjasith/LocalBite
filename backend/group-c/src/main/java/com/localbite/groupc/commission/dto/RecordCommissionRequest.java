package com.localbite.groupc.commission.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public class RecordCommissionRequest {

    @NotNull
    private Long orderId;

    @NotNull
    private Long sellerId;

    @NotNull
    @DecimalMin("0.00")
    private BigDecimal foodSubtotal;

    @NotNull
    @DecimalMin("0.00")
    private BigDecimal commissionPercentage;

    @NotNull
    @DecimalMin("0.00")
    private BigDecimal commissionAmount;

    @NotNull
    @DecimalMin("0.00")
    private BigDecimal sellerAmount;

    public Long getOrderId() { return orderId; }
    public void setOrderId(Long orderId) { this.orderId = orderId; }
    public Long getSellerId() { return sellerId; }
    public void setSellerId(Long sellerId) { this.sellerId = sellerId; }
    public BigDecimal getFoodSubtotal() { return foodSubtotal; }
    public void setFoodSubtotal(BigDecimal foodSubtotal) { this.foodSubtotal = foodSubtotal; }
    public BigDecimal getCommissionPercentage() { return commissionPercentage; }
    public void setCommissionPercentage(BigDecimal commissionPercentage) { this.commissionPercentage = commissionPercentage; }
    public BigDecimal getCommissionAmount() { return commissionAmount; }
    public void setCommissionAmount(BigDecimal commissionAmount) { this.commissionAmount = commissionAmount; }
    public BigDecimal getSellerAmount() { return sellerAmount; }
    public void setSellerAmount(BigDecimal sellerAmount) { this.sellerAmount = sellerAmount; }
}
