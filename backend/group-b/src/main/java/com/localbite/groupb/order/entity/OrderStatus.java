package com.localbite.groupb.order.entity;

public enum OrderStatus {
    PENDING_PAYMENT,
    PLACED,
    ACCEPTED,
    PREPARING,
    READY,
    OUT_FOR_DELIVERY,
    OTP_VERIFICATION,
    DELIVERED,
    CANCELLED,
    FAILED
}