package com.localbite.groupd.review.controller;

import com.localbite.groupd.review.dto.CreateReviewRequest;
import com.localbite.groupd.review.dto.RatingSummary;
import com.localbite.groupd.review.dto.ReviewResponse;
import com.localbite.groupd.review.service.ReviewService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController("review_ReviewController")
@RequestMapping("/api/reviews")
public class ReviewController {

    private final ReviewService service;

    public ReviewController(ReviewService service) {
        this.service = service;
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of("status", "UP", "service", "review-service"));
    }

    // ---- CUSTOMER ----
    @PostMapping
    public ResponseEntity<ReviewResponse> create(Authentication auth,
                                                 @Valid @RequestBody CreateReviewRequest req) {
        Long userId = (Long) auth.getCredentials();
        return ResponseEntity.ok(service.create(userId, req));
    }

    @GetMapping("/me")
    public ResponseEntity<List<ReviewResponse>> myReviews(Authentication auth) {
        Long userId = (Long) auth.getCredentials();
        return ResponseEntity.ok(service.byCustomer(userId));
    }

    @DeleteMapping("/{reviewId}")
    public ResponseEntity<Map<String, String>> delete(Authentication auth,
                                                      @PathVariable Long reviewId) {
        Long userId = (Long) auth.getCredentials();
        String role = auth.getAuthorities().iterator().next().getAuthority().replace("ROLE_", "");
        service.delete(reviewId, userId, role);
        return ResponseEntity.ok(Map.of("message", "Review deleted"));
    }

    // ---- PUBLIC ----
    @GetMapping("/seller/{sellerId}")
    public ResponseEntity<List<ReviewResponse>> bySeller(@PathVariable Long sellerId) {
        return ResponseEntity.ok(service.bySeller(sellerId));
    }

    @GetMapping("/food/{foodId}")
    public ResponseEntity<List<ReviewResponse>> byFood(@PathVariable Long foodId) {
        return ResponseEntity.ok(service.byFood(foodId));
    }

    @GetMapping("/seller/{sellerId}/summary")
    public ResponseEntity<RatingSummary> sellerSummary(@PathVariable Long sellerId) {
        return ResponseEntity.ok(service.sellerSummary(sellerId));
    }

    @GetMapping("/food/{foodId}/summary")
    public ResponseEntity<RatingSummary> foodSummary(@PathVariable Long foodId) {
        return ResponseEntity.ok(service.foodSummary(foodId));
    }

    @GetMapping("/order/{orderId}")
    public ResponseEntity<List<ReviewResponse>> byOrder(@PathVariable Long orderId) {
        return ResponseEntity.ok(service.byOrder(orderId));
    }

    // ---- ADMIN ----
    @GetMapping
    public ResponseEntity<List<ReviewResponse>> listAll() {
        return ResponseEntity.ok(service.listAll());
    }

    @PutMapping("/admin/{reviewId}/hide")
    public ResponseEntity<ReviewResponse> toggleVisibility(@PathVariable Long reviewId) {
        return ResponseEntity.ok(service.toggleVisibility(reviewId));
    }
}
