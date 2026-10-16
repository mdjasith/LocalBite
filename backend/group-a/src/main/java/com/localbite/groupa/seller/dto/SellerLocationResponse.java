package com.localbite.groupa.seller.dto;

import com.localbite.groupa.seller.entity.SellerLocation;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public class SellerLocationResponse {

    private Long locationId;
    private Long sellerId;
    private String addressLine;
    private String city;
    private String state;
    private String postalCode;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private LocalDateTime createdAt;

    public static SellerLocationResponse from(SellerLocation l) {
        SellerLocationResponse r = new SellerLocationResponse();
        r.locationId = l.getLocationId();
        r.sellerId = l.getSellerId();
        r.addressLine = l.getAddressLine();
        r.city = l.getCity();
        r.state = l.getState();
        r.postalCode = l.getPostalCode();
        r.latitude = l.getLatitude();
        r.longitude = l.getLongitude();
        r.createdAt = l.getCreatedAt();
        return r;
    }

    public Long getLocationId() { return locationId; }
    public Long getSellerId() { return sellerId; }
    public String getAddressLine() { return addressLine; }
    public String getCity() { return city; }
    public String getState() { return state; }
    public String getPostalCode() { return postalCode; }
    public BigDecimal getLatitude() { return latitude; }
    public BigDecimal getLongitude() { return longitude; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
