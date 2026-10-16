package com.localbite.groupd.delivery.repository;

import com.localbite.groupd.delivery.entity.DeliveryOtp;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface DeliveryOtpRepository extends JpaRepository<DeliveryOtp, Long> {

    Optional<DeliveryOtp> findByOrderId(Long orderId);
}
