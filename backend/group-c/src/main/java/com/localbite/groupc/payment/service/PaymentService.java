package com.localbite.groupc.payment.service;

import com.localbite.groupc.payment.client.OrderClient;
import com.localbite.groupc.payment.client.WalletClient;
import com.localbite.groupc.payment.dto.PaymentResponse;
import com.localbite.groupc.payment.dto.ProcessPaymentRequest;
import com.localbite.groupc.payment.entity.Payment;
import com.localbite.groupc.payment.entity.PaymentMethod;
import com.localbite.groupc.payment.entity.PaymentStatus;
import com.localbite.groupc.payment.repository.PaymentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
public class PaymentService {
    private static final BigDecimal REFUND_TAX_RATE = new BigDecimal("0.02");

    private final PaymentRepository repo;
    private final WalletClient walletClient;
    private final OrderClient orderClient;

    public PaymentService(PaymentRepository repo, WalletClient walletClient, OrderClient orderClient) {
        this.repo = repo;
        this.walletClient = walletClient;
        this.orderClient = orderClient;
    }

    @Transactional
    public PaymentResponse process(ProcessPaymentRequest req, String jwtToken) {
        var existing = repo.findByIdempotencyKey(req.getIdempotencyKey());
        if (existing.isPresent()) return PaymentResponse.from(existing.get());

        Payment p = new Payment();
        p.setOrderId(req.getOrderId());
        p.setCustomerId(req.getCustomerId());
        p.setSellerId(req.getSellerId());
        p.setAmount(req.getAmount());
        p.setPlatformCommission(req.getPlatformCommission());
        p.setSellerAmount(req.getSellerAmount());
        p.setPaymentMethod(req.getPaymentMethod());
        p.setPaymentDetail(req.getPaymentDetail());
        p.setIdempotencyKey(req.getIdempotencyKey());
        p.setPaymentStatus(PaymentStatus.PENDING);
        p.setTransactionReference(generateTxnRef(req.getPaymentMethod().name()));

        Payment saved = repo.save(p);

        try {
            // 1. Debit Customer
            walletClient.debitCustomer(req.getCustomerId(), req.getAmount(), "ORDER", req.getOrderId(), jwtToken);
            
            try {
                // 2. Credit Seller (includes delivery fee)
                walletClient.creditSeller(req.getSellerId(), req.getSellerAmount(), "ORDER", req.getOrderId(), jwtToken);
                // 3. Credit Platform Commission
                walletClient.creditPlatformCommission(req.getPlatformCommission(), "ORDER", req.getOrderId(), jwtToken);
            } catch (Exception e) {
                // Rollback customer if subsequent credits fail
                walletClient.creditCustomer(req.getCustomerId(), req.getAmount(), "REFUND", req.getOrderId(), jwtToken);
                throw new RuntimeException("Failed to credit seller. Customer refunded.");
            }

            saved.setPaymentStatus(PaymentStatus.SUCCESS);
            repo.save(saved);
            orderClient.markOrderPaid(saved.getOrderId(), jwtToken);

            return PaymentResponse.from(saved);

        } catch (Exception e) {
            saved.setPaymentStatus(PaymentStatus.FAILED);
            saved.setFailureReason(e.getMessage());
            repo.save(saved);
            throw new RuntimeException("Payment failed: " + e.getMessage());
        }
    }

    public PaymentResponse getByOrderId(Long orderId) {
        return PaymentResponse.from(repo.findByOrderId(orderId).orElseThrow(() -> new RuntimeException("Payment not found")));
    }

    public List<PaymentResponse> getByCustomer(Long customerId) {
        return repo.findByCustomerIdOrderByCreatedAtDesc(customerId).stream().map(PaymentResponse::from).collect(Collectors.toList());
    }

    public List<PaymentResponse> listAll() {
        return repo.findAll().stream().map(PaymentResponse::from).collect(Collectors.toList());
    }

    @Transactional
    public PaymentResponse refund(Long paymentId) {
        return doRefund(repo.findById(paymentId).orElseThrow(() -> new RuntimeException("Payment not found")));
    }

    @Transactional
    public PaymentResponse refundByOrderId(Long orderId) {
        return doRefund(repo.findByOrderId(orderId).orElseThrow(() -> new RuntimeException("No payment found")));
    }

    private PaymentResponse doRefund(Payment p) {
        if (p.getPaymentStatus() == PaymentStatus.REFUNDED) return PaymentResponse.from(p);
        if (p.getPaymentStatus() != PaymentStatus.SUCCESS) throw new RuntimeException("Only successful payments can be refunded");

        if (p.getPaymentMethod() == PaymentMethod.COD) {
            p.setPaymentStatus(PaymentStatus.CANCELLED);
            p.setRefundedAmount(BigDecimal.ZERO);
        } else {
            BigDecimal refundAmount = p.getAmount().multiply(BigDecimal.ONE.subtract(REFUND_TAX_RATE)).setScale(2, RoundingMode.HALF_UP);
            p.setPaymentStatus(PaymentStatus.REFUNDED);
            p.setRefundedAmount(refundAmount);
        }
        p.setRefundedAt(LocalDateTime.now());
        repo.save(p);
        return PaymentResponse.from(p);
    }

    private String generateTxnRef(String method) {
        String prefix = switch (method) {
            case "UPI" -> "UPI"; case "CARD" -> "CARD"; case "COD" -> "COD"; default -> "TXN";
        };
        return prefix + "-" + UUID.randomUUID().toString().replace("-", "").substring(0, 12).toUpperCase();
    }
}