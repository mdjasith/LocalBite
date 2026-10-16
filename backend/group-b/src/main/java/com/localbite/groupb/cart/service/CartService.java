package com.localbite.groupb.cart.service;

import com.localbite.groupb.cart.client.FoodClient;
import com.localbite.groupb.cart.dto.*;
import com.localbite.groupb.cart.entity.Cart;
import com.localbite.groupb.cart.entity.CartItem;
import com.localbite.groupb.cart.repository.CartItemRepository;
import com.localbite.groupb.cart.repository.CartRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.*;
import java.util.stream.Collectors;

@Service("cart_CartService")
public class CartService {

    private final CartRepository cartRepo;
    private final CartItemRepository itemRepo;
    private final FoodClient foodClient;

    public CartService(CartRepository cartRepo,
                       CartItemRepository itemRepo,
                       FoodClient foodClient) {
        this.cartRepo = cartRepo;
        this.itemRepo = itemRepo;
        this.foodClient = foodClient;
    }

    @Transactional
    public Cart getOrCreate(Long userId) {
        return cartRepo.findByUserId(userId).orElseGet(() -> {
            Cart c = new Cart();
            c.setUserId(userId);
            return cartRepo.save(c);
        });
    }

    public CartResponse view(Long userId) {
        Cart cart = getOrCreate(userId);
        List<CartItem> items = itemRepo.findByCartId(cart.getCartId());

        Map<Long, List<CartItem>> bySeller = items.stream()
                .collect(Collectors.groupingBy(CartItem::getSellerId, LinkedHashMap::new, Collectors.toList()));

        List<SellerCartGroup> groups = new ArrayList<>();
        BigDecimal subtotal = BigDecimal.ZERO;
        int totalItems = 0;

        for (var entry : bySeller.entrySet()) {
            SellerCartGroup g = new SellerCartGroup();
            g.setSellerId(entry.getKey());
            List<CartItemResponse> itemResponses = entry.getValue().stream()
                    .map(CartItemResponse::from)
                    .collect(Collectors.toList());
            g.setItems(itemResponses);

            BigDecimal groupTotal = itemResponses.stream()
                    .map(CartItemResponse::getLineTotal)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            g.setSellerSubtotal(groupTotal);

            groups.add(g);
            subtotal = subtotal.add(groupTotal);
            totalItems += itemResponses.stream().mapToInt(CartItemResponse::getQuantity).sum();
        }

        CartResponse r = new CartResponse();
        r.setCartId(cart.getCartId());
        r.setUserId(userId);
        r.setSellerGroups(groups);
        r.setTotalItems(totalItems);
        r.setCartSubtotal(subtotal);
        return r;
    }

    @Transactional
    public CartResponse addItem(Long userId, AddCartItemRequest req) {
        Cart cart = getOrCreate(userId);

        FoodInfo food = foodClient.getFood(req.getFoodId());
        if (food == null) throw new RuntimeException("Food not found");
        if (!Boolean.TRUE.equals(food.getIsAvailable())) {
            throw new RuntimeException("Food is not available");
        }

        Optional<CartItem> existing = itemRepo.findByCartIdAndFoodId(cart.getCartId(), req.getFoodId());

        int existingQty = existing.map(CartItem::getQuantity).orElse(0);
        int newTotalQty = existingQty + req.getQuantity();
        int availableStock = food.getStockQuantity() == null ? 0 : food.getStockQuantity();

        if (availableStock <= 0) {
            throw new RuntimeException("Out of stock");
        }
        if (newTotalQty > availableStock) {
            throw new RuntimeException(
                    "Only " + availableStock + " available (you already have " + existingQty + " in cart)");
        }

        if (existing.isPresent()) {
            CartItem ci = existing.get();
            ci.setQuantity(newTotalQty);
            ci.setPriceSnapshot(food.getPrice());
            ci.setFoodNameSnapshot(food.getFoodName());
            itemRepo.save(ci);
        } else {
            CartItem ci = new CartItem();
            ci.setCartId(cart.getCartId());
            ci.setSellerId(food.getSellerId());
            ci.setFoodId(food.getFoodId());
            ci.setFoodNameSnapshot(food.getFoodName());
            ci.setPriceSnapshot(food.getPrice());
            ci.setQuantity(req.getQuantity());
            itemRepo.save(ci);
        }

        return view(userId);
    }

    @Transactional
    public CartResponse updateQuantity(Long userId, Long cartItemId, Integer quantity) {
        Cart cart = getOrCreate(userId);
        CartItem item = itemRepo.findById(cartItemId)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));

        if (!item.getCartId().equals(cart.getCartId())) {
            throw new RuntimeException("Not allowed to modify this item");
        }
        if (quantity <= 0) throw new RuntimeException("Quantity must be greater than 0");

        // Check stock
        try {
            FoodInfo food = foodClient.getFood(item.getFoodId());
            int stock = food.getStockQuantity() == null ? 0 : food.getStockQuantity();
            if (quantity > stock) {
                throw new RuntimeException("Only " + stock + " available");
            }
        } catch (RuntimeException re) {
            throw re;
        } catch (Exception ignored) {}

        item.setQuantity(quantity);
        itemRepo.save(item);
        return view(userId);
    }

    @Transactional
    public CartResponse removeItem(Long userId, Long cartItemId) {
        Cart cart = getOrCreate(userId);
        CartItem item = itemRepo.findById(cartItemId)
                .orElseThrow(() -> new RuntimeException("Cart item not found"));

        if (!item.getCartId().equals(cart.getCartId())) {
            throw new RuntimeException("Not allowed to remove this item");
        }
        itemRepo.delete(item);
        return view(userId);
    }

    @Transactional
    public CartResponse clearCart(Long userId) {
        Cart cart = getOrCreate(userId);
        itemRepo.deleteByCartId(cart.getCartId());
        return view(userId);
    }
}