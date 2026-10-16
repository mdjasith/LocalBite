package com.localbite.groupd.invoice.repository;

import com.localbite.groupd.invoice.entity.Invoice;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface InvoiceRepository extends JpaRepository<Invoice, Long> {

    Optional<Invoice> findByOrderId(Long orderId);

    Optional<Invoice> findByInvoiceNumber(String invoiceNumber);

    List<Invoice> findByCustomerIdOrderByCreatedAtDesc(Long customerId);

    List<Invoice> findBySellerIdOrderByCreatedAtDesc(Long sellerId);

    List<Invoice> findAllByOrderByCreatedAtDesc();
}
