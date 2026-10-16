package com.localbite.groupd.delivery.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class AssignDeliveryRequest {

    @NotBlank
    @Size(max = 120)
    private String deliveryPersonName;

    @NotBlank
    @Size(max = 20)
    private String deliveryPersonPhone;

    public String getDeliveryPersonName() { return deliveryPersonName; }
    public void setDeliveryPersonName(String deliveryPersonName) { this.deliveryPersonName = deliveryPersonName; }
    public String getDeliveryPersonPhone() { return deliveryPersonPhone; }
    public void setDeliveryPersonPhone(String deliveryPersonPhone) { this.deliveryPersonPhone = deliveryPersonPhone; }
}
