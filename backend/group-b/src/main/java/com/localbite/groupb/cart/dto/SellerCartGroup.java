package com.localbite.groupb.cart.dto;

import java.math.BigDecimal;
import java.util.List;

public class SellerCartGroup {

    private Long sellerId;
    private List<CartItemResponse> items;
    private BigDecimal sellerSubtotal;

    public Long getSellerId() { return sellerId; }
    public void setSellerId(Long sellerId) { this.sellerId = sellerId; }
    public List<CartItemResponse> getItems() { return items; }
    public void setItems(List<CartItemResponse> items) { this.items = items; }
    public BigDecimal getSellerSubtotal() { return sellerSubtotal; }
    public void setSellerSubtotal(BigDecimal sellerSubtotal) { this.sellerSubtotal = sellerSubtotal; }
}
