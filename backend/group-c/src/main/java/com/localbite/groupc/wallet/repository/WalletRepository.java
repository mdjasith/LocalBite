package com.localbite.groupc.wallet.repository;

import com.localbite.groupc.wallet.entity.Wallet;
import com.localbite.groupc.wallet.entity.WalletType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface WalletRepository extends JpaRepository<Wallet, Long> {

    Optional<Wallet> findByUserIdAndWalletType(Long userId, WalletType walletType);

    Optional<Wallet> findByWalletType(WalletType walletType);

    boolean existsByUserIdAndWalletType(Long userId, WalletType walletType);
}
