package com.localbite.groupa.seller.service;

import com.localbite.groupa.seller.dto.RegisterSellerRequest;
import com.localbite.groupa.seller.dto.SellerResponse;
import com.localbite.groupa.seller.dto.SellerWithLocationResponse;
import com.localbite.groupa.seller.dto.UpdateSellerRequest;
import com.localbite.groupa.seller.entity.OperatingStatus;
import com.localbite.groupa.seller.entity.Seller;
import com.localbite.groupa.seller.entity.SellerStatus;
import com.localbite.groupa.seller.repository.SellerLocationRepository;
import com.localbite.groupa.seller.repository.SellerRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SellerService {

    private final SellerRepository repo;
    private final SellerLocationRepository locationRepository;

    public SellerService(SellerRepository repo,
                         SellerLocationRepository locationRepository) {
        this.repo = repo;
        this.locationRepository = locationRepository;
    }

    @Transactional
    public SellerResponse register(Long authUserId, RegisterSellerRequest req) {
        if (repo.existsByAuthUserId(authUserId)) {
            throw new RuntimeException("Seller already registered for this account");
        }
        Seller s = new Seller();
        s.setAuthUserId(authUserId);
        s.setStoreName(req.getStoreName());
        s.setOwnerName(req.getOwnerName());
        s.setPhoneNumber(req.getPhoneNumber());
        s.setEmail(req.getEmail());
        s.setStoreDescription(req.getStoreDescription());
        s.setSellerStatus(SellerStatus.PENDING);
        s.setOperatingStatus(OperatingStatus.CLOSED);
        return SellerResponse.from(repo.save(s));
    }

    public SellerResponse getById(Long sellerId) {
        Seller s = repo.findById(sellerId)
                .orElseThrow(() -> new RuntimeException("Seller not found"));
        return SellerResponse.from(s);
    }

    public SellerResponse getByAuthUserId(Long authUserId) {
        Seller s = repo.findByAuthUserId(authUserId)
                .orElseThrow(() -> new RuntimeException("Seller not found for this account"));
        return SellerResponse.from(s);
    }

    public List<SellerResponse> listApproved() {
        return repo.findBySellerStatus(SellerStatus.APPROVED).stream()
                .map(SellerResponse::from)
                .collect(Collectors.toList());
    }

    public List<SellerResponse> listAll() {
        return repo.findAll().stream()
                .map(SellerResponse::from)
                .collect(Collectors.toList());
    }

    public List<SellerWithLocationResponse> listApprovedWithLocations() {
        List<Seller> approved = repo.findBySellerStatus(SellerStatus.APPROVED);
        List<SellerWithLocationResponse> result = new ArrayList<>();

        for (Seller s : approved) {
            var locOpt = locationRepository.findBySellerId(s.getSellerId());
            if (locOpt.isEmpty()) {
                continue;
            }
            var loc = locOpt.get();

            SellerWithLocationResponse r = new SellerWithLocationResponse();
            r.setSellerId(s.getSellerId());
            r.setStoreName(s.getStoreName());
            r.setOwnerName(s.getOwnerName());
            r.setPhoneNumber(s.getPhoneNumber());
            r.setSellerStatus(s.getSellerStatus().name());
            r.setOperatingStatus(s.getOperatingStatus().name());
            r.setLatitude(loc.getLatitude());
            r.setLongitude(loc.getLongitude());
            r.setCity(loc.getCity());
            result.add(r);
        }
        return result;
    }

    @Transactional
    public SellerResponse update(Long sellerId, Long authUserId, UpdateSellerRequest req) {
        Seller s = repo.findById(sellerId)
                .orElseThrow(() -> new RuntimeException("Seller not found"));
        if (!s.getAuthUserId().equals(authUserId)) {
            throw new RuntimeException("Not allowed to update this seller");
        }
        s.setStoreName(req.getStoreName());
        s.setOwnerName(req.getOwnerName());
        s.setPhoneNumber(req.getPhoneNumber());
        s.setStoreDescription(req.getStoreDescription());
        return SellerResponse.from(repo.save(s));
    }

    @Transactional
    public SellerResponse updateOperatingStatus(Long sellerId, Long authUserId, OperatingStatus status) {
        Seller s = repo.findById(sellerId)
                .orElseThrow(() -> new RuntimeException("Seller not found"));
        if (!s.getAuthUserId().equals(authUserId)) {
            throw new RuntimeException("Not allowed to change this seller");
        }
        if (s.getSellerStatus() != SellerStatus.APPROVED) {
            throw new RuntimeException("Seller must be APPROVED before changing operating status");
        }
        s.setOperatingStatus(status);
        return SellerResponse.from(repo.save(s));
    }

    @Transactional
    public SellerResponse approve(Long sellerId) {
        Seller s = repo.findById(sellerId)
                .orElseThrow(() -> new RuntimeException("Seller not found"));
        s.setSellerStatus(SellerStatus.APPROVED);
        return SellerResponse.from(repo.save(s));
    }

    @Transactional
    public SellerResponse reject(Long sellerId) {
        Seller s = repo.findById(sellerId)
                .orElseThrow(() -> new RuntimeException("Seller not found"));
        s.setSellerStatus(SellerStatus.REJECTED);
        s.setOperatingStatus(OperatingStatus.CLOSED);
        return SellerResponse.from(repo.save(s));
    }

    @Transactional
    public SellerResponse block(Long sellerId) {
        Seller s = repo.findById(sellerId)
                .orElseThrow(() -> new RuntimeException("Seller not found"));
        s.setSellerStatus(SellerStatus.BLOCKED);
        s.setOperatingStatus(OperatingStatus.CLOSED);
        return SellerResponse.from(repo.save(s));
    }
}