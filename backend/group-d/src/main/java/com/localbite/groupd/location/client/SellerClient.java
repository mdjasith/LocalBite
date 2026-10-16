package com.localbite.groupd.location.client;

import com.localbite.groupd.location.dto.SellerWithLocation;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.Arrays;
import java.util.List;

@Component("location_SellerClient")
public class SellerClient {

    private final RestTemplate restTemplate;

    @Value("${services.seller.url}")
    private String sellerServiceUrl;

    public SellerClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public List<SellerWithLocation> fetchApprovedSellersWithLocations() {
        try {
            SellerWithLocation[] arr = restTemplate.getForObject(
                    sellerServiceUrl + "/api/sellers/with-locations",
                    SellerWithLocation[].class
            );
            return arr == null ? List.of() : Arrays.asList(arr);
        } catch (Exception e) {
            throw new RuntimeException("Could not fetch sellers from Seller Service: " + e.getMessage());
        }
    }
}
