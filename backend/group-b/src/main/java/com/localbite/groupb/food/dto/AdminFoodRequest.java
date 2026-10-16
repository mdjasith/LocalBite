package com.localbite.groupb.food.dto;

import com.localbite.groupb.food.entity.FoodType;
import jakarta.validation.constraints.*;

import java.math.BigDecimal;

public class AdminFoodRequest {

    @NotNull
    private Long sellerId;

    @NotNull
    private Long categoryId;

    @NotBlank
    @Size(max = 150)
    private String foodName;

    @Size(max = 2000)
    private String description;

    @NotNull
    @DecimalMin("0.00")
    private BigDecimal price;

    @NotNull
    @Min(0)
    private Integer stockQuantity;

    @NotNull
    @Min(1)
    private Integer preparationTimeMinutes;

    @NotNull
    private FoodType foodType;

    @Size(max = 500)
    private String imageUrl;

    public Long getSellerId() { return sellerId; }
    public void setSellerId(Long sellerId) { this.sellerId = sellerId; }
    public Long getCategoryId() { return categoryId; }
    public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }
    public String getFoodName() { return foodName; }
    public void setFoodName(String foodName) { this.foodName = foodName; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public BigDecimal getPrice() { return price; }
    public void setPrice(BigDecimal price) { this.price = price; }
    public Integer getStockQuantity() { return stockQuantity; }
    public void setStockQuantity(Integer stockQuantity) { this.stockQuantity = stockQuantity; }
    public Integer getPreparationTimeMinutes() { return preparationTimeMinutes; }
    public void setPreparationTimeMinutes(Integer preparationTimeMinutes) { this.preparationTimeMinutes = preparationTimeMinutes; }
    public FoodType getFoodType() { return foodType; }
    public void setFoodType(FoodType foodType) { this.foodType = foodType; }
    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
}