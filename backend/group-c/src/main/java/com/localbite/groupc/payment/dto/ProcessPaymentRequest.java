package com.localbite.groupc.payment.dto;

import com.localbite.groupc.payment.entity.PaymentMethod;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;

public class ProcessPaymentRequest {

    @NotNull
    private Long orderId;

    @NotNull
    private Long customerId;

    @NotNull
    private Long sellerId;

    @NotNull
    @DecimalMin("0.01")
    private BigDecimal amount;

    @NotNull
    @DecimalMin("0.00")
    private BigDecimal platformCommission;

    @NotNull
    @DecimalMin("0.00")
    private BigDecimal sellerAmount;

    @NotNull
    private PaymentMethod paymentMethod;

    @Size(max = 150)
    private String paymentDetail;

    @NotBlank
    private String idempotencyKey;

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
    public PaymentMethod getPaymentMethod() { return paymentMethod; }
    public void setPaymentMethod(PaymentMethod paymentMethod) { this.paymentMethod = paymentMethod; }
    public String getPaymentDetail() { return paymentDetail; }
    public void setPaymentDetail(String paymentDetail) { this.paymentDetail = paymentDetail; }
    public String getIdempotencyKey() { return idempotencyKey; }
    public void setIdempotencyKey(String idempotencyKey) { this.idempotencyKey = idempotencyKey; }
}