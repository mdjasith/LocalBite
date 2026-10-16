package com.localbite.groupd.notification.dto;

import com.localbite.groupd.notification.entity.Notification;

import java.time.LocalDateTime;

public class NotificationResponse {

    private Long notificationId;
    private Long userId;
    private String notificationType;
    private String title;
    private String message;
    private Boolean isRead;
    private LocalDateTime createdAt;

    public static NotificationResponse from(Notification n) {
        NotificationResponse r = new NotificationResponse();
        r.notificationId = n.getNotificationId();
        r.userId = n.getUserId();
        r.notificationType = n.getNotificationType().name();
        r.title = n.getTitle();
        r.message = n.getMessage();
        r.isRead = n.getIsRead();
        r.createdAt = n.getCreatedAt();
        return r;
    }

    public Long getNotificationId() { return notificationId; }
    public Long getUserId() { return userId; }
    public String getNotificationType() { return notificationType; }
    public String getTitle() { return title; }
    public String getMessage() { return message; }
    public Boolean getIsRead() { return isRead; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
