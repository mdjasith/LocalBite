package com.localbite.groupd.invoice.controller;

import com.localbite.groupd.invoice.dto.GenerateInvoiceRequest;
import com.localbite.groupd.invoice.dto.InvoiceResponse;
import com.localbite.groupd.invoice.service.InvoiceService;
import jakarta.validation.Valid;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.io.File;
import java.util.List;
import java.util.Map;

@RestController("invoice_InvoiceController")
@RequestMapping("/api/invoices")
public class InvoiceController {

    private final InvoiceService service;

    public InvoiceController(InvoiceService service) {
        this.service = service;
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        return ResponseEntity.ok(Map.of("status", "UP", "service", "invoice-service"));
    }

    @PostMapping("/generate")
    public ResponseEntity<InvoiceResponse> generate(@Valid @RequestBody GenerateInvoiceRequest req) {
        return ResponseEntity.ok(service.generate(req));
    }

    @GetMapping("/order/{orderId}")
    public ResponseEntity<InvoiceResponse> byOrder(@PathVariable Long orderId) {
        return ResponseEntity.ok(service.getByOrderId(orderId));
    }

    @GetMapping("/number/{invoiceNumber}")
    public ResponseEntity<InvoiceResponse> byNumber(@PathVariable String invoiceNumber) {
        return ResponseEntity.ok(service.getByNumber(invoiceNumber));
    }

    @GetMapping("/me")
    public ResponseEntity<List<InvoiceResponse>> myInvoices(Authentication auth) {
        Long userId = (Long) auth.getCredentials();
        String role = auth.getAuthorities().iterator().next().getAuthority().replace("ROLE_", "");
        if ("SELLER".equals(role)) {
            return ResponseEntity.ok(service.bySeller(userId));
        }
        return ResponseEntity.ok(service.byCustomer(userId));
    }

    @GetMapping
    public ResponseEntity<List<InvoiceResponse>> listAll() {
        return ResponseEntity.ok(service.listAll());
    }

    @PutMapping("/{invoiceId}/cancel")
    public ResponseEntity<InvoiceResponse> cancel(@PathVariable Long invoiceId) {
        return ResponseEntity.ok(service.cancel(invoiceId));
    }

    // ---- Download PDF ----
    @GetMapping("/order/{orderId}/download")
    public ResponseEntity<Resource> download(@PathVariable Long orderId) {
        InvoiceResponse inv = service.getByOrderId(orderId);
        if (inv.getPdfFilePath() == null) {
            return ResponseEntity.notFound().build();
        }
        File file = new File(inv.getPdfFilePath());
        if (!file.exists()) {
            return ResponseEntity.notFound().build();
        }

        Resource resource = new FileSystemResource(file);

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "attachment; filename=\"" + inv.getInvoiceNumber() + ".pdf\"")
                .contentType(MediaType.APPLICATION_PDF)
                .body(resource);
    }
}
