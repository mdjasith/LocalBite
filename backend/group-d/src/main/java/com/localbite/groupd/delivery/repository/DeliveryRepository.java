package com.localbite.groupd.delivery.repository;

import com.localbite.groupd.delivery.entity.Delivery;
import com.localbite.groupd.delivery.entity.DeliveryStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DeliveryRepository extends JpaRepository<Delivery, Long> {

    Optional<Delivery> findByOrderId(Long orderId);

    List<Delivery> findByDeliveryStatus(DeliveryStatus status);

    List<Delivery> findAllByOrderByCreatedAtDesc();
}
