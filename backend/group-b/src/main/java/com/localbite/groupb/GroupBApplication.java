package com.localbite.groupb;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@ComponentScan(basePackages = {
    "com.localbite.groupb.food",
    "com.localbite.groupb.cart",
    "com.localbite.groupb.order"
})
@EnableJpaRepositories(basePackages = {
    "com.localbite.groupb.food.repository",
    "com.localbite.groupb.cart.repository",
    "com.localbite.groupb.order.repository"
})
@EntityScan(basePackages = {
    "com.localbite.groupb.food.entity",
    "com.localbite.groupb.cart.entity",
    "com.localbite.groupb.order.entity"
})
@EnableScheduling
public class GroupBApplication {
    public static void main(String[] args) {
        SpringApplication.run(GroupBApplication.class, args);
    }
}