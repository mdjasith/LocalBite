package com.localbite.groupb.food.service;

import com.localbite.groupb.food.dto.CategoryRequest;
import com.localbite.groupb.food.dto.CategoryResponse;
import com.localbite.groupb.food.entity.Category;
import com.localbite.groupb.food.repository.CategoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service("food_CategoryService")
public class CategoryService {

    private final CategoryRepository repo;

    public CategoryService(CategoryRepository repo) {
        this.repo = repo;
    }

    public List<CategoryResponse> listActive() {
        return repo.findByIsActive(true).stream()
                .map(CategoryResponse::from)
                .collect(Collectors.toList());
    }

    public List<CategoryResponse> listAll() {
        return repo.findAll().stream().map(CategoryResponse::from).collect(Collectors.toList());
    }

    public CategoryResponse get(Long id) {
        Category c = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));
        return CategoryResponse.from(c);
    }

    @Transactional
    public CategoryResponse create(CategoryRequest req) {
        if (repo.existsByCategoryName(req.getCategoryName())) {
            throw new RuntimeException("Category already exists");
        }
        Category c = new Category();
        c.setCategoryName(req.getCategoryName());
        c.setDescription(req.getDescription());
        c.setIsActive(true);
        return CategoryResponse.from(repo.save(c));
    }

    @Transactional
    public CategoryResponse update(Long id, CategoryRequest req) {
        Category c = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));
        c.setCategoryName(req.getCategoryName());
        c.setDescription(req.getDescription());
        return CategoryResponse.from(repo.save(c));
    }

    @Transactional
    public CategoryResponse toggleActive(Long id) {
        Category c = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));
        c.setIsActive(!Boolean.TRUE.equals(c.getIsActive()));
        return CategoryResponse.from(repo.save(c));
    }

    @Transactional
    public void delete(Long id) {
        Category c = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));
        repo.delete(c);
    }
}
