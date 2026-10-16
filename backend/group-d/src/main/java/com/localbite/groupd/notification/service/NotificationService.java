package com.localbite.groupd.notification.service;

import com.localbite.groupd.notification.dto.EmailRequest;
import com.localbite.groupd.notification.dto.NotificationResponse;
import com.localbite.groupd.notification.dto.SendNotificationRequest;
import com.localbite.groupd.notification.entity.Notification;
import com.localbite.groupd.notification.repository.NotificationRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service("notification_NotificationService")
public class NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);

    private final NotificationRepository repo;

    public NotificationService(NotificationRepository repo) {
        this.repo = repo;
    }

    @Transactional
    public NotificationResponse send(SendNotificationRequest req) {
        Notification n = new Notification();
        n.setUserId(req.getUserId());
        n.setNotificationType(req.getNotificationType());
        n.setTitle(req.getTitle());
        n.setMessage(req.getMessage());
        n.setIsRead(false);

        Notification saved = repo.save(n);

        // Simulated email sending Ã¢â‚¬â€ print to console
        EmailRequest email = new EmailRequest();
        email.setTo("user-" + req.getUserId() + "@localbite.com");
        email.setSubject("[LocalBite] " + req.getTitle());
        email.setBody(buildEmailBody(req));
        simulateEmail(email);

        return NotificationResponse.from(saved);
    }

    private String buildEmailBody(SendNotificationRequest req) {
        return "\n" +
                "==============================================\n" +
                "   LOCALBITE Ã¢â‚¬â€ SIMULATED EMAIL\n" +
                "==============================================\n" +
                "To: user-" + req.getUserId() + "@localbite.com\n" +
                "Subject: " + req.getTitle() + "\n" +
                "----------------------------------------------\n" +
                req.getMessage() + "\n" +
                "----------------------------------------------\n" +
                "No real email was sent. LocalBite is a\n" +
                "portfolio project. All operations simulated.\n" +
                "==============================================\n";
    }

    private void simulateEmail(EmailRequest email) {
        log.info("SIMULATED EMAIL SEND:\n{}", email.getBody());
    }

    public List<NotificationResponse> byUser(Long userId) {
        return repo.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(NotificationResponse::from)
                .collect(Collectors.toList());
    }

    public List<NotificationResponse> unread(Long userId) {
        return repo.findByUserIdAndIsRead(userId, false).stream()
                .map(NotificationResponse::from)
                .collect(Collectors.toList());
    }

    public long unreadCount(Long userId) {
        return repo.countByUserIdAndIsRead(userId, false);
    }

    public List<NotificationResponse> listAll() {
        return repo.findAll().stream()
                .map(NotificationResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional
    public NotificationResponse markRead(Long notificationId, Long userId) {
        Notification n = repo.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        if (!n.getUserId().equals(userId)) {
            throw new RuntimeException("Not allowed to mark this notification");
        }
        n.setIsRead(true);
        return NotificationResponse.from(repo.save(n));
    }

    @Transactional
    public void markAllRead(Long userId) {
        repo.findByUserIdAndIsRead(userId, false).forEach(n -> {
            n.setIsRead(true);
            repo.save(n);
        });
    }

    @Transactional
    public void delete(Long notificationId, Long userId) {
        Notification n = repo.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        if (!n.getUserId().equals(userId)) {
            throw new RuntimeException("Not allowed to delete this notification");
        }
        repo.delete(n);
    }
}
