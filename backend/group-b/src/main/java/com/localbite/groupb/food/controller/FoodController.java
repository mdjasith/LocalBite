package com.localbite.groupb.food.controller;

import com.localbite.groupb.food.dto.*;
import com.localbite.groupb.food.service.FoodService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController("food_FoodController")
@RequestMapping("/api/foods")
public class FoodController {

    private final FoodService service;

    public FoodController(FoodService service) {
        this.service = service;
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of("status", "UP", "service", "food-service"));
    }

    /* ============================== PUBLIC ============================== */

    @GetMapping
    public ResponseEntity<List<FoodResponse>> listAll() {
        return ResponseEntity.ok(service.listAvailable());
    }

    @GetMapping("/{foodId}")
    public ResponseEntity<FoodResponse> getOne(@PathVariable Long foodId) {
        return ResponseEntity.ok(service.get(foodId));
    }

    @GetMapping("/seller/{sellerId}")
    public ResponseEntity<List<FoodResponse>> listBySeller(@PathVariable Long sellerId) {
        return ResponseEntity.ok(service.listBySeller(sellerId));
    }

    @GetMapping("/category/{categoryId}")
    public ResponseEntity<List<FoodResponse>> listByCategory(@PathVariable Long categoryId) {
        return ResponseEntity.ok(service.listByCategory(categoryId));
    }

    @GetMapping("/search")
    public ResponseEntity<List<FoodResponse>> search(@RequestParam String keyword) {
        return ResponseEntity.ok(service.search(keyword));
    }

    /* ============================== SELLER ============================== */

    @PostMapping
    public ResponseEntity<FoodResponse> create(@RequestHeader("Authorization") String auth,
                                               @Valid @RequestBody CreateFoodRequest req) {
        String jwt = auth.replace("Bearer ", "");
        return ResponseEntity.ok(service.create(jwt, req));
    }

    @PutMapping("/{foodId}")
    public ResponseEntity<FoodResponse> update(@RequestHeader("Authorization") String auth,
                                               @PathVariable Long foodId,
                                               @Valid @RequestBody UpdateFoodRequest req) {
        String jwt = auth.replace("Bearer ", "");
        return ResponseEntity.ok(service.update(jwt, foodId, req));
    }

    @PutMapping("/{foodId}/availability")
    public ResponseEntity<FoodResponse> toggle(@RequestHeader("Authorization") String auth,
                                               @PathVariable Long foodId) {
        String jwt = auth.replace("Bearer ", "");
        return ResponseEntity.ok(service.toggleAvailability(jwt, foodId));
    }

    @PutMapping("/{foodId}/stock")
    public ResponseEntity<FoodResponse> setStock(@RequestHeader("Authorization") String auth,
                                                 @PathVariable Long foodId,
                                                 @RequestBody Map<String, Integer> body) {
        String jwt = auth.replace("Bearer ", "");
        Integer stock = body.get("stockQuantity");
        return ResponseEntity.ok(service.updateStock(jwt, foodId, stock));
    }

    @DeleteMapping("/{foodId}")
    public ResponseEntity<Map<String, String>> delete(@RequestHeader("Authorization") String auth,
                                                      @PathVariable Long foodId) {
        String jwt = auth.replace("Bearer ", "");
        service.delete(jwt, foodId);
        return ResponseEntity.ok(Map.of("message", "Food deleted"));
    }

    /* ============================== ADMIN ============================== */

    @PostMapping("/admin")
    public ResponseEntity<FoodResponse> adminCreate(@Valid @RequestBody AdminFoodRequest req) {
        return ResponseEntity.ok(service.adminCreate(req));
    }

    @PutMapping("/admin/{foodId}")
    public ResponseEntity<FoodResponse> adminUpdate(@PathVariable Long foodId,
                                                    @Valid @RequestBody AdminFoodRequest req) {
        return ResponseEntity.ok(service.adminUpdate(foodId, req));
    }

    @DeleteMapping("/admin/{foodId}")
    public ResponseEntity<Map<String, String>> adminDelete(@PathVariable Long foodId) {
        service.adminDelete(foodId);
        return ResponseEntity.ok(Map.of("message", "Food deleted"));
    }

    /* ============================== INTERNAL â€” called by order-service ============================== */

    @PutMapping("/{foodId}/adjust-stock")
    public ResponseEntity<FoodResponse> adjustStock(@PathVariable Long foodId,
                                                    @RequestBody Map<String, Integer> body) {
        Integer delta = body.getOrDefault("delta", 0);
        return ResponseEntity.ok(service.adjustStock(foodId, delta));
    }

    @GetMapping("/{foodId}/check-stock")
    public ResponseEntity<Map<String, Object>> checkStock(@PathVariable Long foodId,
                                                          @RequestParam Integer qty) {
        service.assertStockAvailable(foodId, qty);
        return ResponseEntity.ok(Map.of("available", true));
    }
}