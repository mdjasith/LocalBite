package com.localbite.groupa.user.service;

import com.localbite.groupa.user.dto.AddressRequest;
import com.localbite.groupa.user.dto.AddressResponse;
import com.localbite.groupa.user.entity.UserAddress;
import com.localbite.groupa.user.repository.UserAddressRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserAddressService {

    private final UserAddressRepository repo;

    public UserAddressService(UserAddressRepository repo) {
        this.repo = repo;
    }

    public List<AddressResponse> listByUser(Long userId) {
        return repo.findByUserId(userId).stream()
                .map(AddressResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional
    public AddressResponse add(Long userId, AddressRequest req) {
        if (Boolean.TRUE.equals(req.getIsDefault())) {
            clearDefault(userId);
        }
        UserAddress a = new UserAddress();
        a.setUserId(userId);
        a.setAddressTitle(req.getAddressTitle());
        a.setAddressLine(req.getAddressLine());
        a.setCity(req.getCity());
        a.setState(req.getState());
        a.setPostalCode(req.getPostalCode());
        a.setLatitude(req.getLatitude());
        a.setLongitude(req.getLongitude());
        a.setIsDefault(req.getIsDefault());
        return AddressResponse.from(repo.save(a));
    }

    @Transactional
    public AddressResponse update(Long userId, Long addressId, AddressRequest req) {
        UserAddress a = repo.findById(addressId)
                .orElseThrow(() -> new RuntimeException("Address not found"));
        if (!a.getUserId().equals(userId)) {
            throw new RuntimeException("Address does not belong to this user");
        }
        if (Boolean.TRUE.equals(req.getIsDefault())) {
            clearDefault(userId);
        }
        a.setAddressTitle(req.getAddressTitle());
        a.setAddressLine(req.getAddressLine());
        a.setCity(req.getCity());
        a.setState(req.getState());
        a.setPostalCode(req.getPostalCode());
        a.setLatitude(req.getLatitude());
        a.setLongitude(req.getLongitude());
        a.setIsDefault(req.getIsDefault());
        return AddressResponse.from(repo.save(a));
    }

    @Transactional
    public void delete(Long userId, Long addressId) {
        UserAddress a = repo.findById(addressId)
                .orElseThrow(() -> new RuntimeException("Address not found"));
        if (!a.getUserId().equals(userId)) {
            throw new RuntimeException("Address does not belong to this user");
        }
        repo.delete(a);
    }

    private void clearDefault(Long userId) {
        repo.findByUserId(userId).forEach(a -> {
            if (Boolean.TRUE.equals(a.getIsDefault())) {
                a.setIsDefault(false);
                repo.save(a);
            }
        });
    }
}
