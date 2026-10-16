package com.localbite.groupc.commission.repository;

import com.localbite.groupc.commission.entity.Commission;
import com.localbite.groupc.commission.entity.CommissionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface CommissionRepository extends JpaRepository<Commission, Long> {

    Optional<Commission> findByOrderId(Long orderId);

    List<Commission> findBySellerIdOrderByCreatedAtDesc(Long sellerId);

    List<Commission> findByCommissionStatus(CommissionStatus status);

    List<Commission> findAllByOrderByCreatedAtDesc();

    @Query("SELECT COALESCE(SUM(c.commissionAmount), 0) FROM Commission c")
    BigDecimal totalCommission();

    @Query("SELECT COALESCE(SUM(c.commissionAmount), 0) FROM Commission c WHERE c.sellerId = :sellerId")
    BigDecimal totalCommissionForSeller(@Param("sellerId") Long sellerId);

    @Query("SELECT COALESCE(SUM(c.sellerAmount), 0) FROM Commission c WHERE c.sellerId = :sellerId")
    BigDecimal totalEarningsForSeller(@Param("sellerId") Long sellerId);
}
