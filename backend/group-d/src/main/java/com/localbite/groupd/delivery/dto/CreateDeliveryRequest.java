package com.localbite.groupd.delivery.dto;

import jakarta.validation.constraints.NotNull;

public class CreateDeliveryRequest {

    @NotNull
    private Long orderId;

    public Long getOrderId() { return orderId; }
    public void setOrderId(Long orderId) { this.orderId = orderId; }
}
