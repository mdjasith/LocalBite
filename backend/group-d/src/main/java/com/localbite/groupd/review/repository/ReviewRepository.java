package com.localbite.groupd.review.repository;

import com.localbite.groupd.review.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    List<Review> findBySellerIdAndIsVisibleOrderByCreatedAtDesc(Long sellerId, Boolean isVisible);

    List<Review> findByFoodIdAndIsVisibleOrderByCreatedAtDesc(Long foodId, Boolean isVisible);

    List<Review> findByCustomerIdOrderByCreatedAtDesc(Long customerId);

    List<Review> findByOrderId(Long orderId);

    List<Review> findAllByOrderByCreatedAtDesc();

    boolean existsByOrderIdAndCustomerIdAndFoodId(Long orderId, Long customerId, Long foodId);

    @Query("SELECT COALESCE(AVG(r.rating), 0) FROM Review r WHERE r.sellerId = :sellerId AND r.isVisible = true")
    Double avgRatingForSeller(@Param("sellerId") Long sellerId);

    @Query("SELECT COALESCE(AVG(r.rating), 0) FROM Review r WHERE r.foodId = :foodId AND r.isVisible = true")
    Double avgRatingForFood(@Param("foodId") Long foodId);

    @Query("SELECT COUNT(r) FROM Review r WHERE r.sellerId = :sellerId AND r.isVisible = true")
    long countForSeller(@Param("sellerId") Long sellerId);
}
