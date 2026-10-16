package com.localbite.groupd.delivery.dto;

import java.time.LocalDateTime;

public class OtpResponse {

    private Long orderId;
    private String otp;  // plaintext â€” shown to customer ONLY
    private LocalDateTime expiresAt;
    private Integer attemptsLeft;
    private String message;

    public Long getOrderId() { return orderId; }
    public void setOrderId(Long orderId) { this.orderId = orderId; }
    public String getOtp() { return otp; }
    public void setOtp(String otp) { this.otp = otp; }
    public LocalDateTime getExpiresAt() { return expiresAt; }
    public void setExpiresAt(LocalDateTime expiresAt) { this.expiresAt = expiresAt; }
    public Integer getAttemptsLeft() { return attemptsLeft; }
    public void setAttemptsLeft(Integer attemptsLeft) { this.attemptsLeft = attemptsLeft; }
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }
}
