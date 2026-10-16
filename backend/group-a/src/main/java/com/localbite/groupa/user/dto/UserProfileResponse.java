package com.localbite.groupa.user.dto;

import com.localbite.groupa.user.entity.UserProfile;
import java.time.LocalDateTime;

public class UserProfileResponse {

    private Long userId;
    private String fullName;
    private String phoneNumber;
    private String profileImageUrl;
    private String accountStatus;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public static UserProfileResponse from(UserProfile p) {
        UserProfileResponse r = new UserProfileResponse();
        r.userId = p.getUserId();
        r.fullName = p.getFullName();
        r.phoneNumber = p.getPhoneNumber();
        r.profileImageUrl = p.getProfileImageUrl();
        r.accountStatus = p.getAccountStatus() != null ? p.getAccountStatus().name() : null;
        r.createdAt = p.getCreatedAt();
        r.updatedAt = p.getUpdatedAt();
        return r;
    }

    public Long getUserId() { return userId; }
    public String getFullName() { return fullName; }
    public String getPhoneNumber() { return phoneNumber; }
    public String getProfileImageUrl() { return profileImageUrl; }
    public String getAccountStatus() { return accountStatus; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
