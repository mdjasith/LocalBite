package com.localbite.groupd.invoice.dto;

import com.localbite.groupd.invoice.entity.Invoice;

import java.time.LocalDateTime;

public class InvoiceResponse {

    private Long invoiceId;
    private Long orderId;
    private Long customerId;
    private Long sellerId;
    private String invoiceNumber;
    private String invoiceStatus;
    private String pdfFilePath;
    private Boolean isSimulated;
    private LocalDateTime createdAt;

    public static InvoiceResponse from(Invoice i) {
        InvoiceResponse r = new InvoiceResponse();
        r.invoiceId = i.getInvoiceId();
        r.orderId = i.getOrderId();
        r.customerId = i.getCustomerId();
        r.sellerId = i.getSellerId();
        r.invoiceNumber = i.getInvoiceNumber();
        r.invoiceStatus = i.getInvoiceStatus() != null ? i.getInvoiceStatus().name() : null;
        r.pdfFilePath = i.getPdfFilePath();
        r.isSimulated = i.getIsSimulated();
        r.createdAt = i.getCreatedAt();
        return r;
    }

    public Long getInvoiceId() { return invoiceId; }
    public Long getOrderId() { return orderId; }
    public Long getCustomerId() { return customerId; }
    public Long getSellerId() { return sellerId; }
    public String getInvoiceNumber() { return invoiceNumber; }
    public String getInvoiceStatus() { return invoiceStatus; }
    public String getPdfFilePath() { return pdfFilePath; }
    public Boolean getIsSimulated() { return isSimulated; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
