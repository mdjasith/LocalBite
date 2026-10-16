package com.localbite.groupa.seller.service;

import com.localbite.groupa.seller.dto.SellerLocationRequest;
import com.localbite.groupa.seller.dto.SellerLocationResponse;
import com.localbite.groupa.seller.entity.Seller;
import com.localbite.groupa.seller.entity.SellerLocation;
import com.localbite.groupa.seller.repository.SellerLocationRepository;
import com.localbite.groupa.seller.repository.SellerRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SellerLocationService {

    private final SellerLocationRepository locationRepo;
    private final SellerRepository sellerRepo;

    public SellerLocationService(SellerLocationRepository locationRepo,
                                 SellerRepository sellerRepo) {
        this.locationRepo = locationRepo;
        this.sellerRepo = sellerRepo;
    }

    public SellerLocationResponse get(Long sellerId) {
        SellerLocation l = locationRepo.findBySellerId(sellerId)
                .orElseThrow(() -> new RuntimeException("Location not found"));
        return SellerLocationResponse.from(l);
    }

    @Transactional
    public SellerLocationResponse setLocation(Long sellerId, Long authUserId, SellerLocationRequest req) {
        Seller s = sellerRepo.findById(sellerId)
                .orElseThrow(() -> new RuntimeException("Seller not found"));
        if (!s.getAuthUserId().equals(authUserId)) {
            throw new RuntimeException("Not allowed to modify this seller");
        }

        SellerLocation l = locationRepo.findBySellerId(sellerId).orElseGet(SellerLocation::new);
        l.setSellerId(sellerId);
        l.setAddressLine(req.getAddressLine());
        l.setCity(req.getCity());
        l.setState(req.getState());
        l.setPostalCode(req.getPostalCode());
        l.setLatitude(req.getLatitude());
        l.setLongitude(req.getLongitude());
        return SellerLocationResponse.from(locationRepo.save(l));
    }
}
