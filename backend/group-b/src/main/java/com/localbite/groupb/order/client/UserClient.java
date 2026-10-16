package com.localbite.groupb.order.client;

import com.localbite.groupb.order.dto.UserAddressInfo;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

@Component("order_UserClient")
public class UserClient {

    private final RestTemplate restTemplate;

    @Value("${services.user.url}")
    private String userServiceUrl;

    public UserClient(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public UserAddressInfo getDefaultAddress(Long userId, String jwtToken) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "Bearer " + jwtToken);
            HttpEntity<Void> entity = new HttpEntity<>(headers);

            ResponseEntity<UserAddressInfo[]> response = restTemplate.exchange(
                    userServiceUrl + "/api/users/" + userId + "/addresses",
                    HttpMethod.GET,
                    entity,
                    UserAddressInfo[].class
            );

            UserAddressInfo[] arr = response.getBody();
            if (arr == null || arr.length == 0) {
                return null;
            }
            for (UserAddressInfo a : arr) {
                if (Boolean.TRUE.equals(a.getIsDefault())) {
                    return a;
                }
            }
            return arr[0];
        } catch (Exception e) {
            return null;
        }
    }
}
