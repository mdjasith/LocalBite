package com.localbite.groupb.order.dto;

import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public class PlaceOrderRequest {

    @NotNull
    private String deliveryAddress;

    private BigDecimal deliveryLatitude;
    private BigDecimal deliveryLongitude;

    public String getDeliveryAddress() { return deliveryAddress; }
    public void setDeliveryAddress(String deliveryAddress) { this.deliveryAddress = deliveryAddress; }
    public BigDecimal getDeliveryLatitude() { return deliveryLatitude; }
    public void setDeliveryLatitude(BigDecimal deliveryLatitude) { this.deliveryLatitude = deliveryLatitude; }
    public BigDecimal getDeliveryLongitude() { return deliveryLongitude; }
    public void setDeliveryLongitude(BigDecimal deliveryLongitude) { this.deliveryLongitude = deliveryLongitude; }
}
