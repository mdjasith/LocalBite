package com.localbite.groupa.seller.repository;

import com.localbite.groupa.seller.entity.SellerLocation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SellerLocationRepository extends JpaRepository<SellerLocation, Long> {

    Optional<SellerLocation> findBySellerId(Long sellerId);

    boolean existsBySellerId(Long sellerId);
}
