package com.localbite.groupa.seller.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class RegisterSellerRequest {

    @NotBlank
    @Size(max = 150)
    private String storeName;

    @NotBlank
    @Size(max = 120)
    private String ownerName;

    @Size(max = 20)
    private String phoneNumber;

    @NotBlank
    @Email
    @Size(max = 150)
    private String email;

    @Size(max = 1000)
    private String storeDescription;

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
}
