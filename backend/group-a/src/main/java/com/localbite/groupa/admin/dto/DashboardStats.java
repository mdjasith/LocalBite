package com.localbite.groupa.admin.dto;

import java.math.BigDecimal;

public class DashboardStats {

    // Sellers
    private Long totalSellers;
    private Long approvedSellers;
    private Long pendingSellers;
    private Long rejectedSellers;

    // Orders
    private Long totalOrders;

    // Payments / Money
    private Long totalPayments;
    private BigDecimal totalProcessedAmount;

    // Platform (simulated)
    private BigDecimal platformCommissionEarned;

    private String note = "All metrics are simulated. No real money.";

    public Long getTotalSellers() { return totalSellers; }
    public void setTotalSellers(Long totalSellers) { this.totalSellers = totalSellers; }
    public Long getApprovedSellers() { return approvedSellers; }
    public void setApprovedSellers(Long approvedSellers) { this.approvedSellers = approvedSellers; }
    public Long getPendingSellers() { return pendingSellers; }
    public void setPendingSellers(Long pendingSellers) { this.pendingSellers = pendingSellers; }
    public Long getRejectedSellers() { return rejectedSellers; }
    public void setRejectedSellers(Long rejectedSellers) { this.rejectedSellers = rejectedSellers; }
    public Long getTotalOrders() { return totalOrders; }
    public void setTotalOrders(Long totalOrders) { this.totalOrders = totalOrders; }
    public Long getTotalPayments() { return totalPayments; }
    public void setTotalPayments(Long totalPayments) { this.totalPayments = totalPayments; }
    public BigDecimal getTotalProcessedAmount() { return totalProcessedAmount; }
    public void setTotalProcessedAmount(BigDecimal totalProcessedAmount) { this.totalProcessedAmount = totalProcessedAmount; }
    public BigDecimal getPlatformCommissionEarned() { return platformCommissionEarned; }
    public void setPlatformCommissionEarned(BigDecimal platformCommissionEarned) { this.platformCommissionEarned = platformCommissionEarned; }
    public String getNote() { return note; }
    public void setNote(String note) { this.note = note; }
}
