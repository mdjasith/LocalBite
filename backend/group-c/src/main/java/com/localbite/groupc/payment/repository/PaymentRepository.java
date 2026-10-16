package com.localbite.groupc.payment.repository;

import com.localbite.groupc.payment.entity.Payment;
import com.localbite.groupc.payment.entity.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Long> {

    Optional<Payment> findByIdempotencyKey(String key);

    List<Payment> findByCustomerIdOrderByCreatedAtDesc(Long customerId);

    Optional<Payment> findByOrderId(Long orderId);

    List<Payment> findByPaymentStatus(PaymentStatus status);
}
