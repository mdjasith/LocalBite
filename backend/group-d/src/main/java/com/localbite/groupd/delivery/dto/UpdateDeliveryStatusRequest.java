package com.localbite.groupd.delivery.dto;

import com.localbite.groupd.delivery.entity.DeliveryStatus;
import jakarta.validation.constraints.NotNull;

public class UpdateDeliveryStatusRequest {

    @NotNull
    private DeliveryStatus status;

    public DeliveryStatus getStatus() { return status; }
    public void setStatus(DeliveryStatus status) { this.status = status; }
}
