package com.localbite.groupb.order.scheduler;

import com.localbite.groupb.order.client.DeliveryClient;
import com.localbite.groupb.order.entity.Order;
import com.localbite.groupb.order.entity.OrderStatus;
import com.localbite.groupb.order.repository.OrderRepository;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

@Component("order_OrderAutoAdvanceScheduler")
public class OrderAutoAdvanceScheduler {

    private static final Logger log = LoggerFactory.getLogger(OrderAutoAdvanceScheduler.class);

    // Timings (seconds after order creation)
    private static final long ACCEPT_AFTER_SECONDS     = 120;  // 2:00 â†’ ACCEPTED
    private static final long PREPARE_AFTER_SECONDS    = 130;  // 2:10 â†’ PREPARING
    private static final long READY_AFTER_SECONDS      = 140;  // 2:20 â†’ READY
    private static final long OUT_FOR_DELIVERY_SECONDS = 150;  // 2:30 â†’ OUT_FOR_DELIVERY

    private final OrderRepository orderRepo;
    private final DeliveryClient deliveryClient;

    public OrderAutoAdvanceScheduler(OrderRepository orderRepo, DeliveryClient deliveryClient) {
        this.orderRepo = orderRepo;
        this.deliveryClient = deliveryClient;
    }

    @PostConstruct
    public void init() {
        System.out.println("=================================================");
        System.out.println("  AUTO-ADVANCE SCHEDULER LOADED");
        System.out.println("  ACCEPT=2:00  PREPARE=+10s  READY=+10s  OFD=+10s");
        System.out.println("  Ticking every 5 seconds...");
        System.out.println("=================================================");
    }

    @Scheduled(fixedDelay = 5000, initialDelay = 5000)
    @Transactional
    public void autoAdvanceOrders() {
        LocalDateTime now = LocalDateTime.now();
        System.out.println("[auto-advance] tick at " + now);

        advanceStatus(OrderStatus.PLACED, OrderStatus.ACCEPTED, ACCEPT_AFTER_SECONDS, now);
        advanceStatus(OrderStatus.ACCEPTED, OrderStatus.PREPARING, PREPARE_AFTER_SECONDS, now);
        advanceStatus(OrderStatus.PREPARING, OrderStatus.READY, READY_AFTER_SECONDS, now);

        List<Order> readyOrders = orderRepo.findByOrderStatus(OrderStatus.READY);
        for (Order order : readyOrders) {
            if (hasElapsed(order, OUT_FOR_DELIVERY_SECONDS, now)) {
                order.setOrderStatus(OrderStatus.OUT_FOR_DELIVERY);
                orderRepo.save(order);
                try {
                    deliveryClient.generateOtp(order.getOrderId(), null);
                } catch (Exception e) {
                    log.warn("[auto-advance] OTP gen failed for order {}: {}",
                            order.getOrderId(), e.getMessage());
                }
                System.out.println("[auto-advance] Order #" + order.getOrderId() +
                        " â†’ OUT_FOR_DELIVERY (" + secondsSince(order, now) + "s)");
            }
        }
    }

    private void advanceStatus(OrderStatus from, OrderStatus to,
                               long secondsAfterCreation, LocalDateTime now) {
        List<Order> orders = orderRepo.findByOrderStatus(from);
        for (Order order : orders) {
            if (hasElapsed(order, secondsAfterCreation, now)) {
                order.setOrderStatus(to);
                orderRepo.save(order);
                System.out.println("[auto-advance] Order #" + order.getOrderId() +
                        " â†’ " + to + " (" + secondsSince(order, now) + "s)");
            }
        }
    }

    private boolean hasElapsed(Order order, long seconds, LocalDateTime now) {
        if (order.getCreatedAt() == null) {
            System.out.println("[auto-advance] WARNING: order #" + order.getOrderId() +
                    " has NULL created_at â€” cannot advance");
            return false;
        }
        return Duration.between(order.getCreatedAt(), now).getSeconds() >= seconds;
    }

    private long secondsSince(Order order, LocalDateTime now) {
        if (order.getCreatedAt() == null) return 0;
        return Duration.between(order.getCreatedAt(), now).getSeconds();
    }
}