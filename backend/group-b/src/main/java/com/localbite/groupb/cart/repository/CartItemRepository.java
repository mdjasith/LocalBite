package com.localbite.groupb.cart.repository;

import com.localbite.groupb.cart.entity.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CartItemRepository extends JpaRepository<CartItem, Long> {

    List<CartItem> findByCartId(Long cartId);

    Optional<CartItem> findByCartIdAndFoodId(Long cartId, Long foodId);

    void deleteByCartId(Long cartId);
}
