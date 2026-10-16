package com.localbite.groupd;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@ComponentScan(basePackages = {
    "com.localbite.groupd.delivery",
    "com.localbite.groupd.review",
    "com.localbite.groupd.invoice",
    "com.localbite.groupd.notification",
    "com.localbite.groupd.location"
})
@EnableJpaRepositories(basePackages = {
    "com.localbite.groupd.delivery.repository",
    "com.localbite.groupd.review.repository",
    "com.localbite.groupd.invoice.repository",
    "com.localbite.groupd.notification.repository"
})
@EntityScan(basePackages = {
    "com.localbite.groupd.delivery.entity",
    "com.localbite.groupd.review.entity",
    "com.localbite.groupd.invoice.entity",
    "com.localbite.groupd.notification.entity"
})
public class GroupDApplication {
    public static void main(String[] args) {
        SpringApplication.run(GroupDApplication.class, args);
    }
}