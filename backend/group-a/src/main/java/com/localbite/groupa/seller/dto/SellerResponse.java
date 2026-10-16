package com.localbite.groupa.seller.dto;

import com.localbite.groupa.seller.entity.Seller;
import java.time.LocalDateTime;

public class SellerResponse {

    private Long sellerId;
    private Long authUserId;
    private String storeName;
    private String ownerName;
    private String phoneNumber;
    private String email;
    private String storeDescription;
    private String sellerStatus;
    private String operatingStatus;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static SellerResponse from(Seller s) {
        SellerResponse r = new SellerResponse();
        r.sellerId = s.getSellerId();
        r.authUserId = s.getAuthUserId();
        r.storeName = s.getStoreName();
        r.ownerName = s.getOwnerName();
        r.phoneNumber = s.getPhoneNumber();
        r.email = s.getEmail();
        r.storeDescription = s.getStoreDescription();
        r.sellerStatus = s.getSellerStatus() != null ? s.getSellerStatus().name() : null;
        r.operatingStatus = s.getOperatingStatus() != null ? s.getOperatingStatus().name() : null;
        r.createdAt = s.getCreatedAt();
        r.updatedAt = s.getUpdatedAt();
        return r;
    }

    public Long getSellerId() { return sellerId; }
    public Long getAuthUserId() { return authUserId; }
    public String getStoreName() { return storeName; }
    public String getOwnerName() { return ownerName; }
    public String getPhoneNumber() { return phoneNumber; }
    public String getEmail() { return email; }
    public String getStoreDescription() { return storeDescription; }
    public String getSellerStatus() { return sellerStatus; }
    public String getOperatingStatus() { return operatingStatus; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
