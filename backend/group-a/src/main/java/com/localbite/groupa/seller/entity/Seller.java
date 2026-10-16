package com.localbite.groupa.seller.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "sellers")
public class Seller {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "seller_id")
    private Long sellerId;

    @Column(name = "auth_user_id", nullable = false, unique = true)
    private Long authUserId;

    @Column(name = "store_name", nullable = false, length = 150)
    private String storeName;

    @Column(name = "owner_name", nullable = false, length = 120)
    private String ownerName;

    @Column(name = "phone_number", length = 20)
    private String phoneNumber;

    @Column(name = "email", nullable = false, length = 150)
    private String email;

    @Column(name = "store_description", columnDefinition = "TEXT")
    private String storeDescription;

    @Enumerated(EnumType.STRING)
    @Column(name = "seller_status")
    private SellerStatus sellerStatus = SellerStatus.PENDING;

    @Enumerated(EnumType.STRING)
    @Column(name = "operating_status")
    private OperatingStatus operatingStatus = OperatingStatus.CLOSED;

    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", insertable = false, updatable = false)
    private LocalDateTime updatedAt;

    public Long getSellerId() { return sellerId; }
    public void setSellerId(Long sellerId) { this.sellerId = sellerId; }
    public Long getAuthUserId() { return authUserId; }
    public void setAuthUserId(Long authUserId) { this.authUserId = authUserId; }
    public String getStoreName() { return storeName; }
    public void setStoreName(String storeName) { this.storeName = storeName; }
    public String getOwnerName() { return ownerName; }
    public void setOwnerName(String ownerName) { this.ownerName = ownerName; }
    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getStoreDescription() { return storeDescription; }
    public void setStoreDescription(String storeDescription) { this.storeDescription = storeDescription; }
    public SellerStatus getSellerStatus() { return sellerStatus; }
    public void setSellerStatus(SellerStatus sellerStatus) { this.sellerStatus = sellerStatus; }
    public OperatingStatus getOperatingStatus() { return operatingStatus; }
    public void setOperatingStatus(OperatingStatus operatingStatus) { this.operatingStatus = operatingStatus; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
