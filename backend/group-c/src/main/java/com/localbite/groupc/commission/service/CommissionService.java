package com.localbite.groupc.commission.service;

import com.localbite.groupc.commission.dto.CommissionResponse;
import com.localbite.groupc.commission.dto.EarningsSummary;
import com.localbite.groupc.commission.dto.RecordCommissionRequest;
import com.localbite.groupc.commission.entity.Commission;
import com.localbite.groupc.commission.entity.CommissionStatus;
import com.localbite.groupc.commission.repository.CommissionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service("commission_CommissionService")
public class CommissionService {

    private final CommissionRepository repo;

    public CommissionService(CommissionRepository repo) {
        this.repo = repo;
    }

    @Transactional
    public CommissionResponse record(RecordCommissionRequest req) {
        // Idempotent: one commission per order
        var existing = repo.findByOrderId(req.getOrderId());
        if (existing.isPresent()) {
            return CommissionResponse.from(existing.get());
        }

        Commission c = new Commission();
        c.setOrderId(req.getOrderId());
        c.setSellerId(req.getSellerId());
        c.setFoodSubtotal(req.getFoodSubtotal());
        c.setCommissionPercentage(req.getCommissionPercentage());
        c.setCommissionAmount(req.getCommissionAmount());
        c.setSellerAmount(req.getSellerAmount());
        c.setCommissionStatus(CommissionStatus.CALCULATED);

        return CommissionResponse.from(repo.save(c));
    }

    public CommissionResponse getByOrderId(Long orderId) {
        Commission c = repo.findByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Commission not found"));
        return CommissionResponse.from(c);
    }

    public List<CommissionResponse> getBySeller(Long sellerId) {
        return repo.findBySellerIdOrderByCreatedAtDesc(sellerId).stream()
                .map(CommissionResponse::from)
                .collect(Collectors.toList());
    }

    public List<CommissionResponse> listAll() {
        return repo.findAllByOrderByCreatedAtDesc().stream()
                .map(CommissionResponse::from)
                .collect(Collectors.toList());
    }

    public List<CommissionResponse> listByStatus(CommissionStatus status) {
        return repo.findByCommissionStatus(status).stream()
                .map(CommissionResponse::from)
                .collect(Collectors.toList());
    }

    public EarningsSummary sellerSummary(Long sellerId) {
        BigDecimal earnings = repo.totalEarningsForSeller(sellerId);
        BigDecimal commission = repo.totalCommissionForSeller(sellerId);
        EarningsSummary s = new EarningsSummary();
        s.setSellerId(sellerId);
        s.setTotalEarnings(earnings);
        s.setTotalCommission(commission);
        s.setGrossSales(earnings.add(commission));
        return s;
    }

    @Transactional
    public CommissionResponse settle(Long commissionId) {
        Commission c = repo.findById(commissionId)
                .orElseThrow(() -> new RuntimeException("Commission not found"));
        if (c.getCommissionStatus() == CommissionStatus.SETTLED) {
            throw new RuntimeException("Commission already settled");
        }
        c.setCommissionStatus(CommissionStatus.SETTLED);
        c.setSettledAt(LocalDateTime.now());
        return CommissionResponse.from(repo.save(c));
    }
}
