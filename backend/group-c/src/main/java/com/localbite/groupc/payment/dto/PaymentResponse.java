package com.localbite.groupc.payment.dto;

import com.localbite.groupc.payment.entity.Payment;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class PaymentResponse {

    private Long paymentId;
    private Long orderId;
    private Long customerId;
    private Long sellerId;
    private BigDecimal amount;
    private BigDecimal platformCommission;
    private BigDecimal sellerAmount;
    private String paymentMethod;
    private String paymentDetail;
    private String paymentStatus;
    private String idempotencyKey;
    private String transactionReference;
    private String failureReason;
    private LocalDateTime refundedAt;
    private BigDecimal refundedAmount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static PaymentResponse from(Payment p) {
        PaymentResponse r = new PaymentResponse();
        r.paymentId = p.getPaymentId();
        r.orderId = p.getOrderId();
        r.customerId = p.getCustomerId();
        r.sellerId = p.getSellerId();
        r.amount = p.getAmount();
        r.platformCommission = p.getPlatformCommission();
        r.sellerAmount = p.getSellerAmount();
        r.paymentMethod = p.getPaymentMethod() != null ? p.getPaymentMethod().name() : null;
        r.paymentDetail = p.getPaymentDetail();
        r.paymentStatus = p.getPaymentStatus() != null ? p.getPaymentStatus().name() : null;
        r.idempotencyKey = p.getIdempotencyKey();
        r.transactionReference = p.getTransactionReference();
        r.failureReason = p.getFailureReason();
        r.refundedAt = p.getRefundedAt();
        r.refundedAmount = p.getRefundedAmount();
        r.createdAt = p.getCreatedAt();
        r.updatedAt = p.getUpdatedAt();
        return r;
    }

    public Long getPaymentId() { return paymentId; }
    public Long getOrderId() { return orderId; }
    public Long getCustomerId() { return customerId; }
    public Long getSellerId() { return sellerId; }
    public BigDecimal getAmount() { return amount; }
    public BigDecimal getPlatformCommission() { return platformCommission; }
    public BigDecimal getSellerAmount() { return sellerAmount; }
    public String getPaymentMethod() { return paymentMethod; }
    public String getPaymentDetail() { return paymentDetail; }
    public String getPaymentStatus() { return paymentStatus; }
    public String getIdempotencyKey() { return idempotencyKey; }
    public String getTransactionReference() { return transactionReference; }
    public String getFailureReason() { return failureReason; }
    public LocalDateTime getRefundedAt() { return refundedAt; }
    public BigDecimal getRefundedAmount() { return refundedAmount; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}