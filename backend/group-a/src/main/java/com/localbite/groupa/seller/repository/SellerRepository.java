package com.localbite.groupa.seller.repository;

import com.localbite.groupa.seller.entity.Seller;
import com.localbite.groupa.seller.entity.SellerStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SellerRepository extends JpaRepository<Seller, Long> {

    Optional<Seller> findByAuthUserId(Long authUserId);

    boolean existsByAuthUserId(Long authUserId);

    List<Seller> findBySellerStatus(SellerStatus status);
}
