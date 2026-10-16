package com.localbite.groupd.location.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public class NearbySellersRequest {

    @NotNull
    @DecimalMin("-90.0") @DecimalMax("90.0")
    private BigDecimal latitude;

    @NotNull
    @DecimalMin("-180.0") @DecimalMax("180.0")
    private BigDecimal longitude;

    private BigDecimal radiusKm = BigDecimal.valueOf(10);

    public BigDecimal getLatitude() { return latitude; }
    public void setLatitude(BigDecimal latitude) { this.latitude = latitude; }
    public BigDecimal getLongitude() { return longitude; }
    public void setLongitude(BigDecimal longitude) { this.longitude = longitude; }
    public BigDecimal getRadiusKm() { return radiusKm; }
    public void setRadiusKm(BigDecimal radiusKm) { this.radiusKm = radiusKm; }
}
