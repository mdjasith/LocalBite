package com.localbite.groupb.food.repository;

import com.localbite.groupb.food.entity.Food;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FoodRepository extends JpaRepository<Food, Long> {

    List<Food> findBySellerId(Long sellerId);

    List<Food> findBySellerIdAndIsAvailable(Long sellerId, Boolean isAvailable);

    List<Food> findByCategoryId(Long categoryId);

    List<Food> findByIsAvailable(Boolean isAvailable);

    List<Food> findByFoodNameContainingIgnoreCaseAndIsAvailable(String keyword, Boolean isAvailable);
}
