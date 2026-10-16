package com.localbite.groupa.user.service;

import com.localbite.groupa.user.dto.CreateProfileRequest;
import com.localbite.groupa.user.dto.UpdateProfileRequest;
import com.localbite.groupa.user.dto.UserProfileResponse;
import com.localbite.groupa.user.entity.AccountStatus;
import com.localbite.groupa.user.entity.UserProfile;
import com.localbite.groupa.user.repository.UserProfileRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserProfileService {

    private final UserProfileRepository repo;

    public UserProfileService(UserProfileRepository repo) {
        this.repo = repo;
    }

    public UserProfileResponse get(Long userId) {
        UserProfile p = repo.findById(userId)
                .orElseThrow(() -> new RuntimeException("Profile not found"));
        return UserProfileResponse.from(p);
    }

    @Transactional
    public UserProfileResponse create(Long userId, CreateProfileRequest req) {
        if (repo.existsById(userId)) {
            throw new RuntimeException("Profile already exists");
        }
        UserProfile p = new UserProfile();
        p.setUserId(userId);
        p.setFullName(req.getFullName());
        p.setPhoneNumber(req.getPhoneNumber());
        p.setProfileImageUrl(req.getProfileImageUrl());
        p.setAccountStatus(AccountStatus.ACTIVE);
        return UserProfileResponse.from(repo.save(p));
    }

    @Transactional
    public UserProfileResponse update(Long userId, UpdateProfileRequest req) {
        UserProfile p = repo.findById(userId)
                .orElseThrow(() -> new RuntimeException("Profile not found"));
        p.setFullName(req.getFullName());
        p.setPhoneNumber(req.getPhoneNumber());
        p.setProfileImageUrl(req.getProfileImageUrl());
        return UserProfileResponse.from(repo.save(p));
    }
}
