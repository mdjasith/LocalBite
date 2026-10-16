package com.localbite.groupc.payment.service;

import com.localbite.groupc.payment.client.OrderClient;
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

@Service("payment_PaymentService")
public class PaymentService {

    // 2% cancellation fee Ã¢â‚¬â€ customer receives 98% of amount on refund
    private static final BigDecimal REFUND_TAX_RATE = new BigDecimal("0.02");

    private final PaymentRepository repo;
    private final OrderClient orderClient;

    public PaymentService(PaymentRepository repo, OrderClient orderClient) {
        this.repo = repo;
        this.orderClient = orderClient;
    }

    @Transactional
    public PaymentResponse process(ProcessPaymentRequest req, String jwtToken) {

        // Idempotency Ã¢â‚¬â€ return existing record as-is
        var existing = repo.findByIdempotencyKey(req.getIdempotencyKey());
        if (existing.isPresent()) {
            return PaymentResponse.from(existing.get());
        }

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

        // Simulate gateway processing delay
        try { Thread.sleep(700); } catch (InterruptedException ignored) {}

        // All simulated payments succeed (UPI / Card / COD all approved)
        saved.setPaymentStatus(PaymentStatus.SUCCESS);
        repo.save(saved);

        // Notify order-service that this order is now paid
        orderClient.markOrderPaid(saved.getOrderId(), jwtToken);

        return PaymentResponse.from(saved);
    }

    public PaymentResponse getByOrderId(Long orderId) {
        Payment p = repo.findByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Payment not found for this order"));
        return PaymentResponse.from(p);
    }

    public List<PaymentResponse> getByCustomer(Long customerId) {
        return repo.findByCustomerIdOrderByCreatedAtDesc(customerId).stream()
                .map(PaymentResponse::from)
                .collect(Collectors.toList());
    }

    public List<PaymentResponse> listAll() {
        return repo.findAll().stream().map(PaymentResponse::from).collect(Collectors.toList());
    }

    @Transactional
    public PaymentResponse refund(Long paymentId) {
        Payment p = repo.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found"));
        return doRefund(p);
    }

    @Transactional
    public PaymentResponse refundByOrderId(Long orderId) {
        Payment p = repo.findByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("No payment found for this order"));
        return doRefund(p);
    }

    /**
     * Refund logic:
     *  - If already REFUNDED Ã¢â€ â€™ return existing
     *  - If not SUCCESS Ã¢â€ â€™ throw
     *  - COD Ã¢â€ â€™ status becomes CANCELLED, refundedAmount = 0
     *  - UPI / CARD Ã¢â€ â€™ status becomes REFUNDED, refundedAmount = amount Ãƒâ€” 0.98
     */
    private PaymentResponse doRefund(Payment p) {
        if (p.getPaymentStatus() == PaymentStatus.REFUNDED) {
            return PaymentResponse.from(p);
        }
        if (p.getPaymentStatus() != PaymentStatus.SUCCESS) {
            throw new RuntimeException("Only successful payments can be refunded");
        }

        if (p.getPaymentMethod() == PaymentMethod.COD) {
            // COD was never charged Ã¢â‚¬â€ nothing to refund
            p.setPaymentStatus(PaymentStatus.CANCELLED);
            p.setRefundedAmount(BigDecimal.ZERO);
        } else {
            // 2% cancellation tax Ã¢â€ â€™ customer receives 98%
            BigDecimal refundAmount = p.getAmount()
                    .multiply(BigDecimal.ONE.subtract(REFUND_TAX_RATE))
                    .setScale(2, RoundingMode.HALF_UP);
            p.setPaymentStatus(PaymentStatus.REFUNDED);
            p.setRefundedAmount(refundAmount);
        }

        p.setRefundedAt(LocalDateTime.now());
        repo.save(p);
        return PaymentResponse.from(p);
    }

    private String generateTxnRef(String method) {
        String prefix = switch (method) {
            case "UPI" -> "UPI";
            case "CARD" -> "CARD";
            case "COD" -> "COD";
            default -> "TXN";
        };
        return prefix + "-" + UUID.randomUUID().toString()
                .replace("-", "").substring(0, 12).toUpperCase();
    }
}