package com.localbite.groupa.admin.dto;

import java.math.BigDecimal;

public class PaymentInfo {

    private Long paymentId;
    private Long orderId;
    private Long customerId;
    private Long sellerId;
    private BigDecimal amount;
    private BigDecimal platformCommission;
    private BigDecimal sellerAmount;
    private String paymentStatus;

    public Long getPaymentId() { return paymentId; }
    public void setPaymentId(Long paymentId) { this.paymentId = paymentId; }
    public Long getOrderId() { return orderId; }
    public void setOrderId(Long orderId) { this.orderId = orderId; }
    public Long getCustomerId() { return customerId; }
    public void setCustomerId(Long customerId) { this.customerId = customerId; }
    public Long getSellerId() { return sellerId; }
    public void setSellerId(Long sellerId) { this.sellerId = sellerId; }
    public BigDecimal getAmount() { return amount; }
    public void setAmount(BigDecimal amount) { this.amount = amount; }
    public BigDecimal getPlatformCommission() { return platformCommission; }
    public void setPlatformCommission(BigDecimal platformCommission) { this.platformCommission = platformCommission; }
    public BigDecimal getSellerAmount() { return sellerAmount; }
    public void setSellerAmount(BigDecimal sellerAmount) { this.sellerAmount = sellerAmount; }
    public String getPaymentStatus() { return paymentStatus; }
    public void setPaymentStatus(String paymentStatus) { this.paymentStatus = paymentStatus; }
}
