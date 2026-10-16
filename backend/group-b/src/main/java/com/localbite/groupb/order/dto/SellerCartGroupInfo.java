package com.localbite.groupb.order.dto;

import java.math.BigDecimal;
import java.util.List;

public class SellerCartGroupInfo {

    private Long sellerId;
    private List<CartItemInfo> items;
    private BigDecimal sellerSubtotal;

    public Long getSellerId() { return sellerId; }
    public void setSellerId(Long sellerId) { this.sellerId = sellerId; }
    public List<CartItemInfo> getItems() { return items; }
    public void setItems(List<CartItemInfo> items) { this.items = items; }
    public BigDecimal getSellerSubtotal() { return sellerSubtotal; }
    public void setSellerSubtotal(BigDecimal sellerSubtotal) { this.sellerSubtotal = sellerSubtotal; }
}
