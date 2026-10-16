package com.localbite.groupd.delivery.dto;

import com.localbite.groupd.delivery.entity.Delivery;

import java.time.LocalDateTime;

public class DeliveryResponse {

    private Long deliveryId;
    private Long orderId;
    private String deliveryStatus;
    private String deliveryPersonName;
    private String deliveryPersonPhone;
    private LocalDateTime assignedAt;
    private LocalDateTime pickedUpAt;
    private LocalDateTime outForDeliveryAt;
    private LocalDateTime deliveredAt;
    private LocalDateTime createdAt;

    public static DeliveryResponse from(Delivery d) {
        DeliveryResponse r = new DeliveryResponse();
        r.deliveryId = d.getDeliveryId();
        r.orderId = d.getOrderId();
        r.deliveryStatus = d.getDeliveryStatus() != null ? d.getDeliveryStatus().name() : null;
        r.deliveryPersonName = d.getDeliveryPersonName();
        r.deliveryPersonPhone = d.getDeliveryPersonPhone();
        r.assignedAt = d.getAssignedAt();
        r.pickedUpAt = d.getPickedUpAt();
        r.outForDeliveryAt = d.getOutForDeliveryAt();
        r.deliveredAt = d.getDeliveredAt();
        r.createdAt = d.getCreatedAt();
        return r;
    }

    public Long getDeliveryId() { return deliveryId; }
    public Long getOrderId() { return orderId; }
    public String getDeliveryStatus() { return deliveryStatus; }
    public String getDeliveryPersonName() { return deliveryPersonName; }
    public String getDeliveryPersonPhone() { return deliveryPersonPhone; }
    public LocalDateTime getAssignedAt() { return assignedAt; }
    public LocalDateTime getPickedUpAt() { return pickedUpAt; }
    public LocalDateTime getOutForDeliveryAt() { return outForDeliveryAt; }
    public LocalDateTime getDeliveredAt() { return deliveredAt; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
