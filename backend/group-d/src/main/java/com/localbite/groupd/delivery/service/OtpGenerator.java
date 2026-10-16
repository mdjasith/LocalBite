package com.localbite.groupd.delivery.service;

import org.springframework.stereotype.Component;

import java.security.SecureRandom;

@Component("delivery_OtpGenerator")
public class OtpGenerator {

    private final SecureRandom random = new SecureRandom();

    public String generate4Digit() {
        int value = 1000 + random.nextInt(9000);
        return String.valueOf(value);
    }
}
