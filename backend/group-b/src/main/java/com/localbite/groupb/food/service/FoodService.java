package com.localbite.groupb.food.service;

import com.localbite.groupb.food.client.SellerClient;
import com.localbite.groupb.food.dto.*;
import com.localbite.groupb.food.entity.Food;
import com.localbite.groupb.food.repository.CategoryRepository;
import com.localbite.groupb.food.repository.FoodRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service("food_FoodService")
public class FoodService {

    private final FoodRepository repo;
    private final CategoryRepository categoryRepo;
    private final SellerClient sellerClient;

    public FoodService(FoodRepository repo,
                       CategoryRepository categoryRepo,
                       SellerClient sellerClient) {
        this.repo = repo;
        this.categoryRepo = categoryRepo;
        this.sellerClient = sellerClient;
    }

    /* ============================== PUBLIC / SELLER ============================== */

    public FoodResponse get(Long foodId) {
        Food f = repo.findById(foodId)
                .orElseThrow(() -> new RuntimeException("Food not found"));
        return FoodResponse.from(f);
    }

    public List<FoodResponse> listAvailable() {
        return repo.findByIsAvailable(true).stream()
                .map(FoodResponse::from)
                .collect(Collectors.toList());
    }

    public List<FoodResponse> listBySeller(Long sellerId) {
        return repo.findBySellerIdAndIsAvailable(sellerId, true).stream()
                .map(FoodResponse::from)
                .collect(Collectors.toList());
    }

    public List<FoodResponse> listAllBySeller(Long sellerId) {
        return repo.findBySellerId(sellerId).stream()
                .map(FoodResponse::from)
                .collect(Collectors.toList());
    }

    public List<FoodResponse> listByCategory(Long categoryId) {
        return repo.findByCategoryId(categoryId).stream()
                .filter(f -> Boolean.TRUE.equals(f.getIsAvailable()))
                .map(FoodResponse::from)
                .collect(Collectors.toList());
    }

    public List<FoodResponse> search(String keyword) {
        return repo.findByFoodNameContainingIgnoreCaseAndIsAvailable(keyword, true).stream()
                .map(FoodResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional
    public FoodResponse create(String jwtToken, CreateFoodRequest req) {
        if (!categoryRepo.existsById(req.getCategoryId())) {
            throw new RuntimeException("Category not found");
        }
        SellerInfo seller = sellerClient.getCurrentSeller(jwtToken);
        if (seller == null) throw new RuntimeException("Seller not found");
        if (!"APPROVED".equals(seller.getSellerStatus())) {
            throw new RuntimeException("Seller must be APPROVED to add food");
        }

        Food f = new Food();
        f.setSellerId(seller.getSellerId());
        f.setCategoryId(req.getCategoryId());
        f.setFoodName(req.getFoodName());
        f.setDescription(req.getDescription());
        f.setPrice(req.getPrice());
        f.setStockQuantity(req.getStockQuantity());
        f.setPreparationTimeMinutes(req.getPreparationTimeMinutes());
        f.setFoodType(req.getFoodType());
        f.setImageUrl(req.getImageUrl());
        f.setIsAvailable(true);
        return FoodResponse.from(repo.save(f));
    }

    @Transactional
    public FoodResponse update(String jwtToken, Long foodId, UpdateFoodRequest req) {
        Food f = repo.findById(foodId)
                .orElseThrow(() -> new RuntimeException("Food not found"));

        SellerInfo seller = sellerClient.getCurrentSeller(jwtToken);
        if (seller == null || !f.getSellerId().equals(seller.getSellerId())) {
            throw new RuntimeException("Not allowed to modify this food");
        }
        if (!categoryRepo.existsById(req.getCategoryId())) {
            throw new RuntimeException("Category not found");
        }

        f.setCategoryId(req.getCategoryId());
        f.setFoodName(req.getFoodName());
        f.setDescription(req.getDescription());
        f.setPrice(req.getPrice());
        f.setStockQuantity(req.getStockQuantity());
        f.setPreparationTimeMinutes(req.getPreparationTimeMinutes());
        f.setFoodType(req.getFoodType());
        f.setImageUrl(req.getImageUrl());
        return FoodResponse.from(repo.save(f));
    }

    @Transactional
    public FoodResponse toggleAvailability(String jwtToken, Long foodId) {
        Food f = repo.findById(foodId)
                .orElseThrow(() -> new RuntimeException("Food not found"));

        SellerInfo seller = sellerClient.getCurrentSeller(jwtToken);
        if (seller == null || !f.getSellerId().equals(seller.getSellerId())) {
            throw new RuntimeException("Not allowed to modify this food");
        }

        f.setIsAvailable(!Boolean.TRUE.equals(f.getIsAvailable()));
        return FoodResponse.from(repo.save(f));
    }

    @Transactional
    public FoodResponse updateStock(String jwtToken, Long foodId, Integer stock) {
        Food f = repo.findById(foodId)
                .orElseThrow(() -> new RuntimeException("Food not found"));

        SellerInfo seller = sellerClient.getCurrentSeller(jwtToken);
        if (seller == null || !f.getSellerId().equals(seller.getSellerId())) {
            throw new RuntimeException("Not allowed to modify this food");
        }
        if (stock < 0) throw new RuntimeException("Stock cannot be negative");

        f.setStockQuantity(stock);
        return FoodResponse.from(repo.save(f));
    }

    @Transactional
    public void delete(String jwtToken, Long foodId) {
        Food f = repo.findById(foodId)
                .orElseThrow(() -> new RuntimeException("Food not found"));

        SellerInfo seller = sellerClient.getCurrentSeller(jwtToken);
        if (seller == null || !f.getSellerId().equals(seller.getSellerId())) {
            throw new RuntimeException("Not allowed to delete this food");
        }
        repo.delete(f);
    }

    /* ============================== ADMIN ============================== */

    @Transactional
    public FoodResponse adminCreate(AdminFoodRequest req) {
        if (!categoryRepo.existsById(req.getCategoryId())) {
            throw new RuntimeException("Category not found");
        }
        Food f = new Food();
        f.setSellerId(req.getSellerId());
        f.setCategoryId(req.getCategoryId());
        f.setFoodName(req.getFoodName());
        f.setDescription(req.getDescription());
        f.setPrice(req.getPrice());
        f.setStockQuantity(req.getStockQuantity());
        f.setPreparationTimeMinutes(req.getPreparationTimeMinutes());
        f.setFoodType(req.getFoodType());
        f.setImageUrl(req.getImageUrl());
        f.setIsAvailable(true);
        return FoodResponse.from(repo.save(f));
    }

    @Transactional
    public FoodResponse adminUpdate(Long foodId, AdminFoodRequest req) {
        Food f = repo.findById(foodId)
                .orElseThrow(() -> new RuntimeException("Food not found"));
        if (!categoryRepo.existsById(req.getCategoryId())) {
            throw new RuntimeException("Category not found");
        }
        f.setSellerId(req.getSellerId());
        f.setCategoryId(req.getCategoryId());
        f.setFoodName(req.getFoodName());
        f.setDescription(req.getDescription());
        f.setPrice(req.getPrice());
        f.setStockQuantity(req.getStockQuantity());
        f.setPreparationTimeMinutes(req.getPreparationTimeMinutes());
        f.setFoodType(req.getFoodType());
        f.setImageUrl(req.getImageUrl());
        return FoodResponse.from(repo.save(f));
    }

    @Transactional
    public void adminDelete(Long foodId) {
        Food f = repo.findById(foodId)
                .orElseThrow(() -> new RuntimeException("Food not found"));
        repo.delete(f);
    }

    /* ============================== INTERNAL â€” stock adjustment ============================== */

    /**
     * Adjust stock by a signed delta.
     * delta < 0 â†’ reduce (order placed)
     * delta > 0 â†’ restore (order cancelled)
     * Never goes below 0.
     */
    @Transactional
    public FoodResponse adjustStock(Long foodId, Integer delta) {
        Food f = repo.findById(foodId)
                .orElseThrow(() -> new RuntimeException("Food not found"));
        int current = f.getStockQuantity() == null ? 0 : f.getStockQuantity();
        int updated = current + (delta == null ? 0 : delta);
        if (updated < 0) updated = 0;
        f.setStockQuantity(updated);
        return FoodResponse.from(repo.save(f));
    }

    /** Validate that food is orderable and has enough stock. */
    public void assertStockAvailable(Long foodId, Integer requestedQty) {
        Food f = repo.findById(foodId)
                .orElseThrow(() -> new RuntimeException("Food not found"));
        if (!Boolean.TRUE.equals(f.getIsAvailable())) {
            throw new RuntimeException("Food is not available: " + f.getFoodName());
        }
        int stock = f.getStockQuantity() == null ? 0 : f.getStockQuantity();
        if (stock < requestedQty) {
            throw new RuntimeException(
                    "Only " + stock + " left of " + f.getFoodName());
        }
    }
}