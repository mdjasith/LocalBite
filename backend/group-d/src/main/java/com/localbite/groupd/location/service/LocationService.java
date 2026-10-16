package com.localbite.groupd.location.service;

import com.localbite.groupd.location.client.SellerClient;
import com.localbite.groupd.location.dto.NearbySellersRequest;
import com.localbite.groupd.location.dto.SellerDistanceResponse;
import com.localbite.groupd.location.dto.SellerWithLocation;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service("location_LocationService")
public class LocationService {

    private final SellerClient sellerClient;
    private final DistanceService distanceService;

    public LocationService(SellerClient sellerClient, DistanceService distanceService) {
        this.sellerClient = sellerClient;
        this.distanceService = distanceService;
    }

    public List<SellerDistanceResponse> findNearbySellers(NearbySellersRequest req) {
        double customerLat = req.getLatitude().doubleValue();
        double customerLng = req.getLongitude().doubleValue();
        double radius = req.getRadiusKm() == null ? 10.0 : req.getRadiusKm().doubleValue();

        List<SellerWithLocation> sellers = sellerClient.fetchApprovedSellersWithLocations();

        return sellers.stream()
                .filter(s -> s.getLatitude() != null && s.getLongitude() != null)
                .map(s -> {
                    double d = distanceService.distanceKm(
                            customerLat, customerLng,
                            s.getLatitude().doubleValue(),
                            s.getLongitude().doubleValue()
                    );
                    SellerDistanceResponse r = new SellerDistanceResponse();
                    r.setSellerId(s.getSellerId());
                    r.setStoreName(s.getStoreName());
                    r.setOwnerName(s.getOwnerName());
                    r.setPhoneNumber(s.getPhoneNumber());
                    r.setOperatingStatus(s.getOperatingStatus());
                    r.setCity(s.getCity());
                    r.setLatitude(s.getLatitude());
                    r.setLongitude(s.getLongitude());
                    r.setDistanceKm(Math.round(d * 100.0) / 100.0);
                    return r;
                })
                .filter(r -> r.getDistanceKm() <= radius)
                .sorted(Comparator.comparingDouble(SellerDistanceResponse::getDistanceKm))
                .collect(Collectors.toList());
    }

    public double distanceBetween(BigDecimal lat1, BigDecimal lng1, BigDecimal lat2, BigDecimal lng2) {
        double d = distanceService.distanceKm(
                lat1.doubleValue(), lng1.doubleValue(),
                lat2.doubleValue(), lng2.doubleValue()
        );
        return Math.round(d * 100.0) / 100.0;
    }
}
