package com.localbite.groupb.order.dto;

import com.localbite.groupb.order.entity.OrderItem;

import java.math.BigDecimal;

public class OrderItemResponse {

    private Long orderItemId;
    private Long foodId;
    private String foodName;
    private Integer quantity;
    private BigDecimal pricePerItem;
    private BigDecimal totalPrice;

    public static OrderItemResponse from(OrderItem i) {
        OrderItemResponse r = new OrderItemResponse();
        r.orderItemId = i.getOrderItemId();
        r.foodId = i.getFoodId();
        r.foodName = i.getFoodNameSnapshot();
        r.quantity = i.getQuantity();
        r.pricePerItem = i.getPricePerItem();
        r.totalPrice = i.getTotalPrice();
        return r;
    }

    public Long getOrderItemId() { return orderItemId; }
    public Long getFoodId() { return foodId; }
    public String getFoodName() { return foodName; }
    public Integer getQuantity() { return quantity; }
    public BigDecimal getPricePerItem() { return pricePerItem; }
    public BigDecimal getTotalPrice() { return totalPrice; }
}
