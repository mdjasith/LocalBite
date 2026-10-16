package com.localbite.groupb.order.repository;

import com.localbite.groupb.order.entity.Order;
import com.localbite.groupb.order.entity.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByCustomerIdOrderByCreatedAtDesc(Long customerId);

    List<Order> findBySellerIdOrderByCreatedAtDesc(Long sellerId);

    List<Order> findBySellerIdAndOrderStatus(Long sellerId, OrderStatus status);

    List<Order> findAllByOrderByCreatedAtDesc();

    List<Order> findByOrderStatus(OrderStatus status);
}