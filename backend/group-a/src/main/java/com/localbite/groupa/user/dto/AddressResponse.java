package com.localbite.groupa.user.dto;

import com.localbite.groupa.user.entity.UserAddress;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public class AddressResponse {

    private Long addressId;
    private Long userId;
    private String addressTitle;
    private String addressLine;
    private String city;
    private String state;
    private String postalCode;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private Boolean isDefault;
    private LocalDateTime createdAt;

    public static AddressResponse from(UserAddress a) {
        AddressResponse r = new AddressResponse();
        r.addressId = a.getAddressId();
        r.userId = a.getUserId();
        r.addressTitle = a.getAddressTitle();
        r.addressLine = a.getAddressLine();
        r.city = a.getCity();
        r.state = a.getState();
        r.postalCode = a.getPostalCode();
        r.latitude = a.getLatitude();
        r.longitude = a.getLongitude();
        r.isDefault = a.getIsDefault();
        r.createdAt = a.getCreatedAt();
        return r;
    }

    public Long getAddressId() { return addressId; }
    public Long getUserId() { return userId; }
    public String getAddressTitle() { return addressTitle; }
    public String getAddressLine() { return addressLine; }
    public String getCity() { return city; }
    public String getState() { return state; }
    public String getPostalCode() { return postalCode; }
    public BigDecimal getLatitude() { return latitude; }
    public BigDecimal getLongitude() { return longitude; }
    public Boolean getIsDefault() { return isDefault; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
