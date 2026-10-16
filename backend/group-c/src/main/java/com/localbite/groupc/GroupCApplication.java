package com.localbite.groupc;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@ComponentScan(basePackages = {
    "com.localbite.groupc.payment",
    "com.localbite.groupc.wallet",
    "com.localbite.groupc.commission"
})
@EnableJpaRepositories(basePackages = {
    "com.localbite.groupc.payment.repository",
    "com.localbite.groupc.wallet.repository",
    "com.localbite.groupc.commission.repository"
})
@EntityScan(basePackages = {
    "com.localbite.groupc.payment.entity",
    "com.localbite.groupc.wallet.entity",
    "com.localbite.groupc.commission.entity"
})
public class GroupCApplication {
    public static void main(String[] args) {
        SpringApplication.run(GroupCApplication.class, args);
    }
}