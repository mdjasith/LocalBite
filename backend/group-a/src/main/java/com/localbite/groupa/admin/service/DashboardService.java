package com.localbite.groupa.admin.service;

import com.localbite.groupa.admin.client.PaymentClient;
import com.localbite.groupa.admin.client.SellerClient;
import com.localbite.groupa.admin.dto.DashboardStats;
import com.localbite.groupa.admin.dto.PaymentInfo;
import com.localbite.groupa.admin.dto.SellerInfo;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class DashboardService {

    private final SellerClient sellerClient;
    private final PaymentClient paymentClient;

    public DashboardService(SellerClient sellerClient, PaymentClient paymentClient) {
        this.sellerClient = sellerClient;
        this.paymentClient = paymentClient;
    }

    public DashboardStats buildStats(String adminJwt) {
        DashboardStats s = new DashboardStats();

        List<SellerInfo> sellers = sellerClient.listAllSellers(adminJwt);
        long total = sellers.size();
        long approved = sellers.stream().filter(x -> "APPROVED".equals(x.getSellerStatus())).count();
        long pending = sellers.stream().filter(x -> "PENDING".equals(x.getSellerStatus())).count();
        long rejected = sellers.stream().filter(x -> "REJECTED".equals(x.getSellerStatus())).count();

        s.setTotalSellers(total);
        s.setApprovedSellers(approved);
        s.setPendingSellers(pending);
        s.setRejectedSellers(rejected);

        List<PaymentInfo> payments = paymentClient.listAllPayments(adminJwt);
        long successCount = payments.stream()
                .filter(p -> "SUCCESS".equals(p.getPaymentStatus()))
                .count();

        BigDecimal totalAmount = payments.stream()
                .filter(p -> "SUCCESS".equals(p.getPaymentStatus()) && p.getAmount() != null)
                .map(PaymentInfo::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalCommission = payments.stream()
                .filter(p -> "SUCCESS".equals(p.getPaymentStatus()) && p.getPlatformCommission() != null)
                .map(PaymentInfo::getPlatformCommission)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        s.setTotalPayments(successCount);
        s.setTotalProcessedAmount(totalAmount);
        s.setPlatformCommissionEarned(totalCommission);
        s.setTotalOrders((long) payments.size());

        return s;
    }
}
