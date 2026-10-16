package com.localbite.groupb.order.dto;

import java.math.BigDecimal;
import java.util.List;

public class CartInfo {

    private Long cartId;
    private Long userId;
    private List<SellerCartGroupInfo> sellerGroups;
    private Integer totalItems;
    private BigDecimal cartSubtotal;

    public Long getCartId() { return cartId; }
    public void setCartId(Long cartId) { this.cartId = cartId; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public List<SellerCartGroupInfo> getSellerGroups() { return sellerGroups; }
    public void setSellerGroups(List<SellerCartGroupInfo> sellerGroups) { this.sellerGroups = sellerGroups; }
    public Integer getTotalItems() { return totalItems; }
    public void setTotalItems(Integer totalItems) { this.totalItems = totalItems; }
    public BigDecimal getCartSubtotal() { return cartSubtotal; }
    public void setCartSubtotal(BigDecimal cartSubtotal) { this.cartSubtotal = cartSubtotal; }
}
