package com.localbite.groupd.delivery.service;

import com.localbite.groupd.delivery.dto.*;
import com.localbite.groupd.delivery.entity.Delivery;
import com.localbite.groupd.delivery.entity.DeliveryOtp;
import com.localbite.groupd.delivery.entity.DeliveryStatus;
import com.localbite.groupd.delivery.repository.DeliveryOtpRepository;
import com.localbite.groupd.delivery.repository.DeliveryRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service("delivery_DeliveryService")
public class DeliveryService {

    // 24 hours Ã¢â‚¬â€ so nothing expires mid-demo
    private static final int OTP_EXPIRY_MINUTES = 1440;
    private static final int MAX_ATTEMPTS = 10;

    private final DeliveryRepository deliveryRepo;
    private final DeliveryOtpRepository otpRepo;
    private final PasswordEncoder passwordEncoder;
    private final OtpGenerator otpGenerator;

    public DeliveryService(DeliveryRepository deliveryRepo,
                           DeliveryOtpRepository otpRepo,
                           PasswordEncoder passwordEncoder,
                           OtpGenerator otpGenerator) {
        this.deliveryRepo = deliveryRepo;
        this.otpRepo = otpRepo;
        this.passwordEncoder = passwordEncoder;
        this.otpGenerator = otpGenerator;
    }

    @Transactional
    public DeliveryResponse create(CreateDeliveryRequest req) {
        var existing = deliveryRepo.findByOrderId(req.getOrderId());
        if (existing.isPresent()) {
            return DeliveryResponse.from(existing.get());
        }
        Delivery d = new Delivery();
        d.setOrderId(req.getOrderId());
        d.setDeliveryStatus(DeliveryStatus.NOT_ASSIGNED);
        return DeliveryResponse.from(deliveryRepo.save(d));
    }

    @Transactional
    public DeliveryResponse assign(Long orderId, AssignDeliveryRequest req) {
        Delivery d = deliveryRepo.findByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Delivery not found"));
        d.setDeliveryPersonName(req.getDeliveryPersonName());
        d.setDeliveryPersonPhone(req.getDeliveryPersonPhone());
        d.setDeliveryStatus(DeliveryStatus.ASSIGNED);
        d.setAssignedAt(LocalDateTime.now());
        return DeliveryResponse.from(deliveryRepo.save(d));
    }

    @Transactional
    public DeliveryResponse updateStatus(Long orderId, DeliveryStatus newStatus) {
        Delivery d = deliveryRepo.findByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Delivery not found"));
        d.setDeliveryStatus(newStatus);
        LocalDateTime now = LocalDateTime.now();
        switch (newStatus) {
            case PICKED_UP -> d.setPickedUpAt(now);
            case OUT_FOR_DELIVERY -> d.setOutForDeliveryAt(now);
            case DELIVERED -> d.setDeliveredAt(now);
            default -> { }
        }
        return DeliveryResponse.from(deliveryRepo.save(d));
    }

    /**
     * STRICT IDEMPOTENT generate:
     * - If OTP exists and is NOT yet verified Ã¢â€ â€™ reuse it AS-IS. Do not regenerate.
     * - Only regenerate if the OTP was verified (previous delivery completed)
     *   or the record genuinely doesn't exist.
     */
    @Transactional
    public OtpResponse generateOtp(Long orderId) {
        var existing = otpRepo.findByOrderId(orderId);

        if (existing.isPresent()) {
            DeliveryOtp otp = existing.get();
            // Reuse existing OTP unless it's already been successfully verified
            if (!Boolean.TRUE.equals(otp.getIsVerified()) && otp.getOtpPlain() != null) {
                return buildOtpResponse(orderId, otp, "OTP already active.");
            }
        }

        String plainOtp = otpGenerator.generate4Digit();
        String hashed = passwordEncoder.encode(plainOtp);

        DeliveryOtp otp = existing.orElseGet(DeliveryOtp::new);
        otp.setOrderId(orderId);
        otp.setOtpHash(hashed);
        otp.setOtpPlain(plainOtp);
        otp.setExpiresAt(LocalDateTime.now().plusMinutes(OTP_EXPIRY_MINUTES));
        otp.setAttempts(0);
        otp.setMaxAttempts(MAX_ATTEMPTS);
        otp.setIsVerified(false);
        otp.setVerifiedAt(null);
        otpRepo.save(otp);

        return buildOtpResponse(orderId, otp, "OTP generated.");
    }

    public OtpResponse viewOtp(Long orderId) {
        DeliveryOtp otp = otpRepo.findByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("No OTP generated for this order"));
        if (Boolean.TRUE.equals(otp.getIsVerified())) {
            throw new RuntimeException("OTP already used");
        }
        if (otp.getExpiresAt() != null && otp.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("OTP expired");
        }
        return buildOtpResponse(orderId, otp, null);
    }

    @Transactional
    public DeliveryResponse verifyOtp(Long orderId, VerifyOtpRequest req) {
        Delivery d = deliveryRepo.findByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Delivery not found"));

        DeliveryOtp otp = otpRepo.findByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("No OTP for this order"));

        if (Boolean.TRUE.equals(otp.getIsVerified())) {
            throw new RuntimeException("OTP already used");
        }
        if (otp.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("OTP expired");
        }
        if (otp.getAttempts() >= otp.getMaxAttempts()) {
            throw new RuntimeException("Maximum attempts exceeded. Contact support.");
        }

        // Trim whitespace to be safe
        String entered = req.getOtp() == null ? "" : req.getOtp().trim();

        // Debug logging Ã¢â‚¬â€ remove later
        System.out.println("[OTP DEBUG] order=" + orderId
                + " entered='" + entered + "'"
                + " storedPlain='" + otp.getOtpPlain() + "'");

        if (!passwordEncoder.matches(entered, otp.getOtpHash())) {
            otp.setAttempts(otp.getAttempts() + 1);
            otpRepo.save(otp);
            int left = otp.getMaxAttempts() - otp.getAttempts();
            throw new RuntimeException("Invalid OTP. Attempts left: " + Math.max(left, 0));
        }

        otp.setIsVerified(true);
        otp.setVerifiedAt(LocalDateTime.now());
        otpRepo.save(otp);

        d.setDeliveryStatus(DeliveryStatus.DELIVERED);
        d.setDeliveredAt(LocalDateTime.now());
        return DeliveryResponse.from(deliveryRepo.save(d));
    }

    public DeliveryResponse getByOrderId(Long orderId) {
        Delivery d = deliveryRepo.findByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Delivery not found"));
        return DeliveryResponse.from(d);
    }

    public List<DeliveryResponse> listAll() {
        return deliveryRepo.findAllByOrderByCreatedAtDesc().stream()
                .map(DeliveryResponse::from)
                .collect(Collectors.toList());
    }

    public List<DeliveryResponse> listByStatus(DeliveryStatus status) {
        return deliveryRepo.findByDeliveryStatus(status).stream()
                .map(DeliveryResponse::from)
                .collect(Collectors.toList());
    }

    private OtpResponse buildOtpResponse(Long orderId, DeliveryOtp otp, String message) {
        OtpResponse r = new OtpResponse();
        r.setOrderId(orderId);
        r.setOtp(otp.getOtpPlain());
        r.setExpiresAt(otp.getExpiresAt());
        r.setAttemptsLeft(otp.getMaxAttempts() - otp.getAttempts());
        r.setMessage(message);
        return r;
    }
}