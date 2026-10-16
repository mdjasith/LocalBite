package com.localbite.groupb.food.dto;

import com.localbite.groupb.food.entity.Category;
import java.time.LocalDateTime;

public class CategoryResponse {

    private Long categoryId;
    private String categoryName;
    private String description;
    private Boolean isActive;
    private LocalDateTime createdAt;

    public static CategoryResponse from(Category c) {
        CategoryResponse r = new CategoryResponse();
        r.categoryId = c.getCategoryId();
        r.categoryName = c.getCategoryName();
        r.description = c.getDescription();
        r.isActive = c.getIsActive();
        r.createdAt = c.getCreatedAt();
        return r;
    }

    public Long getCategoryId() { return categoryId; }
    public String getCategoryName() { return categoryName; }
    public String getDescription() { return description; }
    public Boolean getIsActive() { return isActive; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
