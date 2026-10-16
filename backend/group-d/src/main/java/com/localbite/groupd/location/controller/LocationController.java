package com.localbite.groupd.location.controller;

import com.localbite.groupd.location.dto.NearbySellersRequest;
import com.localbite.groupd.location.dto.SellerDistanceResponse;
import com.localbite.groupd.location.service.LocationService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController("location_LocationController")
@RequestMapping("/api/locations")
public class LocationController {

    private final LocationService service;

    public LocationController(LocationService service) {
        this.service = service;
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of("status", "UP", "service", "location-service"));
    }

    @PostMapping("/nearby-sellers")
    public ResponseEntity<List<SellerDistanceResponse>> nearbySellers(
            @Valid @RequestBody NearbySellersRequest req) {
        return ResponseEntity.ok(service.findNearbySellers(req));
    }

    @GetMapping("/distance")
    public ResponseEntity<Map<String, Double>> distance(
            @RequestParam BigDecimal fromLat,
            @RequestParam BigDecimal fromLng,
            @RequestParam BigDecimal toLat,
            @RequestParam BigDecimal toLng) {
        double d = service.distanceBetween(fromLat, fromLng, toLat, toLng);
        return ResponseEntity.ok(Map.of("distanceKm", d));
    }
}
