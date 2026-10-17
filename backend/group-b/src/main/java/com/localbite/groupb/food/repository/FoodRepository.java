package com.localbite.groupb.food.repository;

import com.localbite.groupb.food.entity.Food;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface FoodRepository extends JpaRepository<Food, Long> {
    List<Food> findByIsAvailable(Boolean isAvailable);
    List<Food> findBySellerIdAndIsAvailable(Long sellerId, Boolean isAvailable);
    List<Food> findByCategoryId(Long categoryId);
    List<Food> findBySellerId(Long sellerId);
    List<Food> findByFoodNameContainingIgnoreCaseAndIsAvailable(String foodName, Boolean isAvailable);

    @Modifying
    @Query("UPDATE Food f SET f.stockQuantity = f.stockQuantity - :qty WHERE f.foodId = :id AND f.stockQuantity >= :qty")
    int reduceStock(@Param("id") Long id, @Param("qty") int qty);
}