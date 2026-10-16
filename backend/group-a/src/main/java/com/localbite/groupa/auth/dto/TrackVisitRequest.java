package com.localbite.groupa.auth.dto;

public class TrackVisitRequest {
    private String visitorId;
    private Long userId;
    private String email;
    private String role;
    private String eventType;   // VISIT | LOGIN | REGISTER | LOGOUT | PAGE_VIEW
    private String page;
    private String referrer;

    public String getVisitorId() { return visitorId; }
    public void setVisitorId(String visitorId) { this.visitorId = visitorId; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public String getEventType() { return eventType; }
    public void setEventType(String eventType) { this.eventType = eventType; }
    public String getPage() { return page; }
    public void setPage(String page) { this.page = page; }
    public String getReferrer() { return referrer; }
    public void setReferrer(String referrer) { this.referrer = referrer; }
}