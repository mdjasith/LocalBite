package com.localbite.groupd.invoice.service;

import com.localbite.groupd.invoice.dto.GenerateInvoiceRequest;
import com.localbite.groupd.invoice.dto.InvoiceResponse;
import com.localbite.groupd.invoice.entity.Invoice;
import com.localbite.groupd.invoice.entity.InvoiceStatus;
import com.localbite.groupd.invoice.repository.InvoiceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service("invoice_InvoiceService")
public class InvoiceService {

    private final InvoiceRepository repo;
    private final PdfGeneratorService pdfGenerator;

    public InvoiceService(InvoiceRepository repo, PdfGeneratorService pdfGenerator) {
        this.repo = repo;
        this.pdfGenerator = pdfGenerator;
    }

    @Transactional
    public InvoiceResponse generate(GenerateInvoiceRequest req) {
        // Idempotent: one invoice per order
        var existing = repo.findByOrderId(req.getOrderId());
        if (existing.isPresent()) {
            return InvoiceResponse.from(existing.get());
        }

        // Build the invoice number: LB-SIM-INV-XXXX
        long count = repo.count() + 1;
        String invoiceNumber = String.format("LB-SIM-INV-%04d", count);

        // Generate PDF
        String pdfPath = pdfGenerator.generatePdf(invoiceNumber, req);

        Invoice inv = new Invoice();
        inv.setOrderId(req.getOrderId());
        inv.setCustomerId(req.getCustomerId());
        inv.setSellerId(req.getSellerId());
        inv.setInvoiceNumber(invoiceNumber);
        inv.setInvoiceStatus(InvoiceStatus.GENERATED);
        inv.setPdfFilePath(pdfPath);
        inv.setIsSimulated(true);

        return InvoiceResponse.from(repo.save(inv));
    }

    public InvoiceResponse getByOrderId(Long orderId) {
        Invoice i = repo.findByOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Invoice not found for this order"));
        return InvoiceResponse.from(i);
    }

    public InvoiceResponse getByNumber(String invoiceNumber) {
        Invoice i = repo.findByInvoiceNumber(invoiceNumber)
                .orElseThrow(() -> new RuntimeException("Invoice not found"));
        return InvoiceResponse.from(i);
    }

    public List<InvoiceResponse> byCustomer(Long customerId) {
        return repo.findByCustomerIdOrderByCreatedAtDesc(customerId).stream()
                .map(InvoiceResponse::from)
                .collect(Collectors.toList());
    }

    public List<InvoiceResponse> bySeller(Long sellerId) {
        return repo.findBySellerIdOrderByCreatedAtDesc(sellerId).stream()
                .map(InvoiceResponse::from)
                .collect(Collectors.toList());
    }

    public List<InvoiceResponse> listAll() {
        return repo.findAllByOrderByCreatedAtDesc().stream()
                .map(InvoiceResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional
    public InvoiceResponse cancel(Long invoiceId) {
        Invoice i = repo.findById(invoiceId)
                .orElseThrow(() -> new RuntimeException("Invoice not found"));
        i.setInvoiceStatus(InvoiceStatus.CANCELLED);
        return InvoiceResponse.from(repo.save(i));
    }
}
