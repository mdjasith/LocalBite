package com.localbite.groupb.cart.dto;

import com.localbite.groupb.cart.entity.CartItem;

import java.math.BigDecimal;

public class CartItemResponse {

    private Long cartItemId;
    private Long foodId;
    private String foodName;
    private BigDecimal price;
    private Integer quantity;
    private BigDecimal lineTotal;

    public static CartItemResponse from(CartItem item) {
        CartItemResponse r = new CartItemResponse();
        r.cartItemId = item.getCartItemId();
        r.foodId = item.getFoodId();
        r.foodName = item.getFoodNameSnapshot();
        r.price = item.getPriceSnapshot();
        r.quantity = item.getQuantity();
        r.lineTotal = item.getPriceSnapshot().multiply(BigDecimal.valueOf(item.getQuantity()));
        return r;
    }

    public Long getCartItemId() { return cartItemId; }
    public Long getFoodId() { return foodId; }
    public String getFoodName() { return foodName; }
    public BigDecimal getPrice() { return price; }
    public Integer getQuantity() { return quantity; }
    public BigDecimal getLineTotal() { return lineTotal; }
}
