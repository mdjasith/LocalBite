package com.localbite.groupb.cart.client;

import com.localbite.groupb.cart.dto.FoodInfo;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component("cartFoodClient")
public class FoodClient {

    private final RestTemplate restTemplate;

    @Value("${services.food.url}")
    private String foodServiceUrl;

    public FoodClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public FoodInfo getFood(Long foodId) {
        try {
            return restTemplate.getForObject(
                    foodServiceUrl + "/api/foods/" + foodId,
                    FoodInfo.class
            );
        } catch (Exception e) {
            throw new RuntimeException("Food not found or Food Service unavailable: " + e.getMessage());
        }
    }
}
