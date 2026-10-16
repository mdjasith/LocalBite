package com.localbite.groupd.notification.controller;

import com.localbite.groupd.notification.dto.NotificationResponse;
import com.localbite.groupd.notification.dto.SendNotificationRequest;
import com.localbite.groupd.notification.service.NotificationService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController("notification_NotificationController")
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService service;

    public NotificationController(NotificationService service) {
        this.service = service;
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of("status", "UP", "service", "notification-service"));
    }

    // ---- USER: my notifications ----
    @GetMapping("/me")
    public ResponseEntity<List<NotificationResponse>> myNotifications(Authentication auth) {
        Long userId = (Long) auth.getCredentials();
        return ResponseEntity.ok(service.byUser(userId));
    }

    @GetMapping("/me/unread")
    public ResponseEntity<List<NotificationResponse>> myUnread(Authentication auth) {
        Long userId = (Long) auth.getCredentials();
        return ResponseEntity.ok(service.unread(userId));
    }

    @GetMapping("/me/unread-count")
    public ResponseEntity<Map<String, Long>> unreadCount(Authentication auth) {
        Long userId = (Long) auth.getCredentials();
        return ResponseEntity.ok(Map.of("count", service.unreadCount(userId)));
    }

    @PutMapping("/me/{notificationId}/read")
    public ResponseEntity<NotificationResponse> markRead(Authentication auth,
                                                         @PathVariable Long notificationId) {
        Long userId = (Long) auth.getCredentials();
        return ResponseEntity.ok(service.markRead(notificationId, userId));
    }

    @PutMapping("/me/read-all")
    public ResponseEntity<Map<String, String>> markAllRead(Authentication auth) {
        Long userId = (Long) auth.getCredentials();
        service.markAllRead(userId);
        return ResponseEntity.ok(Map.of("message", "All notifications marked as read"));
    }

    @DeleteMapping("/me/{notificationId}")
    public ResponseEntity<Map<String, String>> delete(Authentication auth,
                                                     @PathVariable Long notificationId) {
        Long userId = (Long) auth.getCredentials();
        service.delete(notificationId, userId);
        return ResponseEntity.ok(Map.of("message", "Notification deleted"));
    }

    // ---- INTERNAL / ADMIN: send ----
    @PostMapping("/send")
    public ResponseEntity<NotificationResponse> send(@Valid @RequestBody SendNotificationRequest req) {
        return ResponseEntity.ok(service.send(req));
    }

    @GetMapping("/admin/all")
    public ResponseEntity<List<NotificationResponse>> listAll() {
        return ResponseEntity.ok(service.listAll());
    }
}
