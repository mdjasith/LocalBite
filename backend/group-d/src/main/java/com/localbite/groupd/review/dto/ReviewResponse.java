package com.localbite.groupd.review.dto;

import com.localbite.groupd.review.entity.Review;

import java.time.LocalDateTime;

public class ReviewResponse {

    private Long reviewId;
    private Long orderId;
    private Long customerId;
    private String customerName;
    private Long sellerId;
    private Long foodId;
    private Integer rating;
    private String reviewText;
    private Boolean isVisible;
    private LocalDateTime createdAt;

    public static ReviewResponse from(Review r) {
        ReviewResponse x = new ReviewResponse();
        x.reviewId = r.getReviewId();
        x.orderId = r.getOrderId();
        x.customerId = r.getCustomerId();
        x.sellerId = r.getSellerId();
        x.foodId = r.getFoodId();
        x.rating = r.getRating();
        x.reviewText = r.getReviewText();
        x.isVisible = r.getIsVisible();
        x.createdAt = r.getCreatedAt();
        return x;
    }

    public Long getReviewId() { return reviewId; }
    public Long getOrderId() { return orderId; }
    public Long getCustomerId() { return customerId; }
    public String getCustomerName() { return customerName; }
    public void setCustomerName(String customerName) { this.customerName = customerName; }
    public Long getSellerId() { return sellerId; }
    public Long getFoodId() { return foodId; }
    public Integer getRating() { return rating; }
    public String getReviewText() { return reviewText; }
    public Boolean getIsVisible() { return isVisible; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}