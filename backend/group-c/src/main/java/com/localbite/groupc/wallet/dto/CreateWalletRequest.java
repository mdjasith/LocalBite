package com.localbite.groupc.wallet.dto;

import com.localbite.groupc.wallet.entity.WalletType;
import jakarta.validation.constraints.NotNull;

public class CreateWalletRequest {

    @NotNull
    private Long userId;

    @NotNull
    private WalletType walletType;

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public WalletType getWalletType() { return walletType; }
    public void setWalletType(WalletType walletType) { this.walletType = walletType; }
}
