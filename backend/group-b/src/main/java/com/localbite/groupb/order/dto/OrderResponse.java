package com.localbite.groupb.order.dto;

import com.localbite.groupb.order.entity.Order;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class OrderResponse {

    private Long orderId;
    private Long customerId;
    private Long sellerId;
    private String orderStatus;
    private String paymentStatus;
    private BigDecimal foodSubtotal;
    private BigDecimal deliveryFee;
    private BigDecimal platformCommission;
    private BigDecimal sellerEarnings;
    private BigDecimal totalAmount;
    private String deliveryAddress;
    private BigDecimal deliveryLatitude;
    private BigDecimal deliveryLongitude;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<OrderItemResponse> items;

    public static OrderResponse from(Order o, List<OrderItemResponse> items) {
        OrderResponse r = new OrderResponse();
        r.orderId = o.getOrderId();
        r.customerId = o.getCustomerId();
        r.sellerId = o.getSellerId();
        r.orderStatus = o.getOrderStatus() != null ? o.getOrderStatus().name() : null;
        r.paymentStatus = o.getPaymentStatus() != null ? o.getPaymentStatus().name() : null;
        r.foodSubtotal = o.getFoodSubtotal();
        r.deliveryFee = o.getDeliveryFee();
        r.platformCommission = o.getPlatformCommission();
        r.sellerEarnings = o.getSellerEarnings();
        r.totalAmount = o.getTotalAmount();
        r.deliveryAddress = o.getDeliveryAddress();
        r.deliveryLatitude = o.getDeliveryLatitude();
        r.deliveryLongitude = o.getDeliveryLongitude();
        r.createdAt = o.getCreatedAt();
        r.updatedAt = o.getUpdatedAt();
        r.items = items;
        return r;
    }

    public Long getOrderId() { return orderId; }
    public Long getCustomerId() { return customerId; }
    public Long getSellerId() { return sellerId; }
    public String getOrderStatus() { return orderStatus; }
    public String getPaymentStatus() { return paymentStatus; }
    public BigDecimal getFoodSubtotal() { return foodSubtotal; }
    public BigDecimal getDeliveryFee() { return deliveryFee; }
    public BigDecimal getPlatformCommission() { return platformCommission; }
    public BigDecimal getSellerEarnings() { return sellerEarnings; }
    public BigDecimal getTotalAmount() { return totalAmount; }
    public String getDeliveryAddress() { return deliveryAddress; }
    public BigDecimal getDeliveryLatitude() { return deliveryLatitude; }
    public BigDecimal getDeliveryLongitude() { return deliveryLongitude; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public List<OrderItemResponse> getItems() { return items; }
}