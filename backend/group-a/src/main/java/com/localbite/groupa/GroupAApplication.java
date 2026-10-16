package com.localbite.groupa;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.context.annotation.ComponentScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication
@ComponentScan(basePackages = {
    "com.localbite.groupa.auth",
    "com.localbite.groupa.user",
    "com.localbite.groupa.seller",
    "com.localbite.groupa.admin"
})
@EnableJpaRepositories(basePackages = {
    "com.localbite.groupa.auth.repository",
    "com.localbite.groupa.user.repository",
    "com.localbite.groupa.seller.repository"
})
@EntityScan(basePackages = {
    "com.localbite.groupa.auth.entity",
    "com.localbite.groupa.user.entity",
    "com.localbite.groupa.seller.entity"
})
public class GroupAApplication {
    public static void main(String[] args) {
        SpringApplication.run(GroupAApplication.class, args);
    }
}