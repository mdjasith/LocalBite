package com.localbite.groupd.review.service;

import com.localbite.groupd.review.client.UserClient;
import com.localbite.groupd.review.dto.CreateReviewRequest;
import com.localbite.groupd.review.dto.RatingSummary;
import com.localbite.groupd.review.dto.ReviewResponse;
import com.localbite.groupd.review.entity.Review;
import com.localbite.groupd.review.repository.ReviewRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service("review_ReviewService")
public class ReviewService {

    private final ReviewRepository repo;
    private final UserClient userClient;

    public ReviewService(ReviewRepository repo, UserClient userClient) {
        this.repo = repo;
        this.userClient = userClient;
    }

    @Transactional
    public ReviewResponse create(Long customerId, CreateReviewRequest req) {
        if (req.getRating() < 1 || req.getRating() > 5) {
            throw new RuntimeException("Rating must be between 1 and 5");
        }

        boolean exists = repo.existsByOrderIdAndCustomerIdAndFoodId(
                req.getOrderId(), customerId, req.getFoodId());
        if (exists) {
            throw new RuntimeException("You already reviewed this food for this order");
        }

        Review r = new Review();
        r.setOrderId(req.getOrderId());
        r.setCustomerId(customerId);
        r.setSellerId(req.getSellerId());
        r.setFoodId(req.getFoodId());
        r.setRating(req.getRating());
        r.setReviewText(req.getReviewText());
        r.setIsVisible(true);

        ReviewResponse resp = ReviewResponse.from(repo.save(r));
        resp.setCustomerName(userClient.getFullName(customerId, null));
        return resp;
    }

    public List<ReviewResponse> bySeller(Long sellerId) {
        return enrich(repo.findBySellerIdAndIsVisibleOrderByCreatedAtDesc(sellerId, true));
    }

    public List<ReviewResponse> byFood(Long foodId) {
        return enrich(repo.findByFoodIdAndIsVisibleOrderByCreatedAtDesc(foodId, true));
    }

    public List<ReviewResponse> byCustomer(Long customerId) {
        return enrich(repo.findByCustomerIdOrderByCreatedAtDesc(customerId));
    }

    public List<ReviewResponse> byOrder(Long orderId) {
        return enrich(repo.findByOrderId(orderId));
    }

    public List<ReviewResponse> listAll() {
        return enrich(repo.findAllByOrderByCreatedAtDesc());
    }

    public RatingSummary sellerSummary(Long sellerId) {
        RatingSummary s = new RatingSummary();
        s.setSellerId(sellerId);
        s.setAverageRating(Math.round(repo.avgRatingForSeller(sellerId) * 100.0) / 100.0);
        s.setTotalReviews(repo.countForSeller(sellerId));
        return s;
    }

    public RatingSummary foodSummary(Long foodId) {
        RatingSummary s = new RatingSummary();
        s.setFoodId(foodId);
        s.setAverageRating(Math.round(repo.avgRatingForFood(foodId) * 100.0) / 100.0);
        return s;
    }

    @Transactional
    public ReviewResponse toggleVisibility(Long reviewId) {
        Review r = repo.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));
        r.setIsVisible(!Boolean.TRUE.equals(r.getIsVisible()));
        ReviewResponse resp = ReviewResponse.from(repo.save(r));
        resp.setCustomerName(userClient.getFullName(r.getCustomerId(), null));
        return resp;
    }

    @Transactional
    public void delete(Long reviewId, Long customerId, String role) {
        Review r = repo.findById(reviewId)
                .orElseThrow(() -> new RuntimeException("Review not found"));
        boolean isAdmin = "ADMIN".equals(role);
        boolean isOwner = "CUSTOMER".equals(role) && r.getCustomerId().equals(customerId);
        if (!isAdmin && !isOwner) {
            throw new RuntimeException("Not allowed to delete this review");
        }
        repo.delete(r);
    }

    private List<ReviewResponse> enrich(List<Review> reviews) {
        return reviews.stream().map(r -> {
            ReviewResponse resp = ReviewResponse.from(r);
            resp.setCustomerName(userClient.getFullName(r.getCustomerId(), null));
            return resp;
        }).collect(Collectors.toList());
    }
}