package com.localbite.groupb.food.dto;

import com.localbite.groupb.food.entity.Food;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public class FoodResponse {

    private Long foodId;
    private Long sellerId;
    private Long categoryId;
    private String foodName;
    private String description;
    private BigDecimal price;
    private Integer stockQuantity;
    private Integer preparationTimeMinutes;
    private String foodType;
    private String imageUrl;
    private Boolean isAvailable;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static FoodResponse from(Food f) {
        FoodResponse r = new FoodResponse();
        r.foodId = f.getFoodId();
        r.sellerId = f.getSellerId();
        r.categoryId = f.getCategoryId();
        r.foodName = f.getFoodName();
        r.description = f.getDescription();
        r.price = f.getPrice();
        r.stockQuantity = f.getStockQuantity();
        r.preparationTimeMinutes = f.getPreparationTimeMinutes();
        r.foodType = f.getFoodType() != null ? f.getFoodType().name() : null;
        r.imageUrl = f.getImageUrl();
        r.isAvailable = f.getIsAvailable();
        r.createdAt = f.getCreatedAt();
        r.updatedAt = f.getUpdatedAt();
        return r;
    }

    public Long getFoodId() { return foodId; }
    public Long getSellerId() { return sellerId; }
    public Long getCategoryId() { return categoryId; }
    public String getFoodName() { return foodName; }
    public String getDescription() { return description; }
    public BigDecimal getPrice() { return price; }
    public Integer getStockQuantity() { return stockQuantity; }
    public Integer getPreparationTimeMinutes() { return preparationTimeMinutes; }
    public String getFoodType() { return foodType; }
    public String getImageUrl() { return imageUrl; }
    public Boolean getIsAvailable() { return isAvailable; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
