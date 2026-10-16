package com.localbite.groupa.seller.dto;

import com.localbite.groupa.seller.entity.OperatingStatus;
import jakarta.validation.constraints.NotNull;

public class UpdateOperatingStatusRequest {

    @NotNull
    private OperatingStatus operatingStatus;

    public OperatingStatus getOperatingStatus() { return operatingStatus; }
    public void setOperatingStatus(OperatingStatus operatingStatus) { this.operatingStatus = operatingStatus; }
}
