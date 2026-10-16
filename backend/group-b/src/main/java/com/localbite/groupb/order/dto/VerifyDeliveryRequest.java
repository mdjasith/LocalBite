package com.localbite.groupb.order.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public class VerifyDeliveryRequest {

    @NotBlank
    @Pattern(regexp = "\\d{4}", message = "OTP must be 4 digits")
    private String otp;

    public String getOtp() { return otp; }
    public void setOtp(String otp) { this.otp = otp; }
}