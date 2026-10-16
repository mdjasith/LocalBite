package com.localbite.groupd.invoice.service;

import com.lowagie.text.*;
import com.lowagie.text.Font;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.localbite.groupd.invoice.dto.GenerateInvoiceRequest;
import com.localbite.groupd.invoice.dto.InvoiceItemRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.awt.Color;
import java.io.File;
import java.io.FileOutputStream;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service("invoice_PdfGeneratorService")
public class PdfGeneratorService {

    @Value("${invoice.storage.path}")
    private String storagePath;

    public String generatePdf(String invoiceNumber, GenerateInvoiceRequest req) {
        try {
            File dir = new File(storagePath);
            if (!dir.exists()) dir.mkdirs();

            String fileName = invoiceNumber + ".pdf";
            String fullPath = new File(dir, fileName).getAbsolutePath();

            Document doc = new Document(PageSize.A4, 40, 40, 50, 50);
            PdfWriter.getInstance(doc, new FileOutputStream(fullPath));
            doc.open();

            // ===== HEADER =====
            Font titleFont = new Font(Font.HELVETICA, 22, Font.BOLD, new Color(230, 100, 30));
            Paragraph title = new Paragraph("LOCALBITE", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            doc.add(title);

            Font subtitleFont = new Font(Font.HELVETICA, 11, Font.ITALIC, Color.DARK_GRAY);
            Paragraph subtitle = new Paragraph("Local Food. Local Sellers. One Marketplace.", subtitleFont);
            subtitle.setAlignment(Element.ALIGN_CENTER);
            doc.add(subtitle);

            Font noticeFont = new Font(Font.HELVETICA, 14, Font.BOLD, Color.RED);
            Paragraph notice = new Paragraph("SIMULATED INVOICE", noticeFont);
            notice.setAlignment(Element.ALIGN_CENTER);
            notice.setSpacingBefore(10);
            doc.add(notice);

            Paragraph disclaimer = new Paragraph(
                    "This is a simulated invoice created as part of a personal portfolio project.\nNo real money was charged.",
                    new Font(Font.HELVETICA, 10, Font.ITALIC, Color.RED));
            disclaimer.setAlignment(Element.ALIGN_CENTER);
            disclaimer.setSpacingAfter(20);
            doc.add(disclaimer);

            // ===== META =====
            doc.add(new Paragraph("Invoice Number: " + invoiceNumber,
                    new Font(Font.HELVETICA, 11, Font.BOLD)));
            doc.add(new Paragraph("Order ID: LB" + req.getOrderId(),
                    new Font(Font.HELVETICA, 11)));
            doc.add(new Paragraph("Date: " +
                    LocalDateTime.now().format(DateTimeFormatter.ofPattern("dd MMM yyyy, HH:mm")),
                    new Font(Font.HELVETICA, 11)));
            doc.add(new Paragraph(" "));

            doc.add(new Paragraph("Customer: " + req.getCustomerName(),
                    new Font(Font.HELVETICA, 11)));
            doc.add(new Paragraph("Seller: " + req.getSellerName(),
                    new Font(Font.HELVETICA, 11)));
            if (req.getDeliveryAddress() != null) {
                doc.add(new Paragraph("Delivery: " + req.getDeliveryAddress(),
                        new Font(Font.HELVETICA, 10, Font.ITALIC, Color.GRAY)));
            }
            doc.add(new Paragraph(" "));

            // ===== ITEMS TABLE =====
            PdfPTable table = new PdfPTable(4);
            table.setWidthPercentage(100);
            table.setWidths(new float[]{3f, 1f, 1.5f, 1.5f});

            table.addCell(headerCell("Item"));
            table.addCell(headerCell("Qty"));
            table.addCell(headerCell("Price"));
            table.addCell(headerCell("Total"));

            for (InvoiceItemRequest item : req.getItems()) {
                table.addCell(bodyCell(item.getFoodName(), false));
                table.addCell(bodyCell(String.valueOf(item.getQuantity()), true));
                table.addCell(bodyCell("Rs " + item.getPrice(), true));
                table.addCell(bodyCell("Rs " + item.getTotalPrice(), true));
            }

            doc.add(table);
            doc.add(new Paragraph(" "));

            // ===== TOTALS =====
            PdfPTable totals = new PdfPTable(2);
            totals.setWidthPercentage(50);
            totals.setHorizontalAlignment(Element.ALIGN_RIGHT);

            totals.addCell(totalLabel("Food Subtotal"));
            totals.addCell(totalValue("Rs " + req.getFoodSubtotal()));
            totals.addCell(totalLabel("Delivery Fee"));
            totals.addCell(totalValue("Rs " + req.getDeliveryFee()));

            PdfPCell finalLabel = new PdfPCell(new Phrase("TOTAL",
                    new Font(Font.HELVETICA, 12, Font.BOLD)));
            finalLabel.setBackgroundColor(new Color(240, 240, 240));
            finalLabel.setPadding(6);
            totals.addCell(finalLabel);

            PdfPCell finalValue = new PdfPCell(new Phrase("Rs " + req.getTotalAmount(),
                    new Font(Font.HELVETICA, 12, Font.BOLD)));
            finalValue.setBackgroundColor(new Color(240, 240, 240));
            finalValue.setPadding(6);
            totals.addCell(finalValue);

            doc.add(totals);
            doc.add(new Paragraph(" "));

            // ===== PAYMENT STATUS =====
            Font statusFont = new Font(Font.HELVETICA, 12, Font.BOLD, new Color(0, 128, 0));
            doc.add(new Paragraph("Payment Status: SIMULATED - PAID", statusFont));

            doc.add(new Paragraph(" "));
            Paragraph footer = new Paragraph(
                    "Thank you for using LocalBite.\nThis invoice is for demonstration purposes only.",
                    new Font(Font.HELVETICA, 9, Font.ITALIC, Color.GRAY));
            footer.setAlignment(Element.ALIGN_CENTER);
            doc.add(footer);

            doc.close();
            return fullPath;

        } catch (Exception e) {
            throw new RuntimeException("PDF generation failed: " + e.getMessage());
        }
    }

    private PdfPCell headerCell(String text) {
        PdfPCell c = new PdfPCell(new Phrase(text, new Font(Font.HELVETICA, 11, Font.BOLD, Color.WHITE)));
        c.setBackgroundColor(new Color(230, 100, 30));
        c.setPadding(6);
        return c;
    }

    private PdfPCell bodyCell(String text, boolean alignRight) {
        PdfPCell c = new PdfPCell(new Phrase(text, new Font(Font.HELVETICA, 10)));
        c.setPadding(5);
        if (alignRight) c.setHorizontalAlignment(Element.ALIGN_RIGHT);
        return c;
    }

    private PdfPCell totalLabel(String text) {
        PdfPCell c = new PdfPCell(new Phrase(text, new Font(Font.HELVETICA, 11)));
        c.setBorder(0);
        c.setPadding(4);
        return c;
    }

    private PdfPCell totalValue(String text) {
        PdfPCell c = new PdfPCell(new Phrase(text, new Font(Font.HELVETICA, 11)));
        c.setBorder(0);
        c.setPadding(4);
        c.setHorizontalAlignment(Element.ALIGN_RIGHT);
        return c;
    }
}
