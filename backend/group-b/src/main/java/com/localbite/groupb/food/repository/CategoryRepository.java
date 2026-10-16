package com.localbite.groupb.food.repository;

import com.localbite.groupb.food.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CategoryRepository extends JpaRepository<Category, Long> {

    List<Category> findByIsActive(Boolean isActive);

    boolean existsByCategoryName(String categoryName);
}
