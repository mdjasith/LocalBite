package com.localbite.groupb.cart.dto;

import java.math.BigDecimal;
import java.util.List;

public class CartResponse {

    private Long cartId;
    private Long userId;
    private List<SellerCartGroup> sellerGroups;
    private Integer totalItems;
    private BigDecimal cartSubtotal;

    public Long getCartId() { return cartId; }
    public void setCartId(Long cartId) { this.cartId = cartId; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public List<SellerCartGroup> getSellerGroups() { return sellerGroups; }
    public void setSellerGroups(List<SellerCartGroup> sellerGroups) { this.sellerGroups = sellerGroups; }
    public Integer getTotalItems() { return totalItems; }
    public void setTotalItems(Integer totalItems) { this.totalItems = totalItems; }
    public BigDecimal getCartSubtotal() { return cartSubtotal; }
    public void setCartSubtotal(BigDecimal cartSubtotal) { this.cartSubtotal = cartSubtotal; }
}
