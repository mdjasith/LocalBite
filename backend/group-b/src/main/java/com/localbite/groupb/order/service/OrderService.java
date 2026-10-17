package com.localbite.groupb.order.service;

import com.localbite.groupb.order.client.*;
import com.localbite.groupb.order.dto.*;
import com.localbite.groupb.order.entity.*;
import com.localbite.groupb.order.repository.OrderItemRepository;
import com.localbite.groupb.order.repository.OrderRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class OrderService {

    private static final BigDecimal COMMISSION_RATE = new BigDecimal("0.10");
    private static final BigDecimal DELIVERY_FEE = new BigDecimal("30.00");

    private final OrderRepository orderRepo;
    private final OrderItemRepository itemRepo;
    private final CartClient cartClient;
    private final SellerClient sellerClient;
    private final DeliveryClient deliveryClient;
    private final CommissionClient commissionClient;
    private final PaymentClient paymentClient;
    private final FoodClient foodClient;
    private final NotificationClient notificationClient;

    public OrderService(OrderRepository orderRepo, OrderItemRepository itemRepo, CartClient cartClient, SellerClient sellerClient, DeliveryClient deliveryClient, CommissionClient commissionClient, PaymentClient paymentClient, FoodClient foodClient, NotificationClient notificationClient) {
        this.orderRepo = orderRepo;
        this.itemRepo = itemRepo;
        this.cartClient = cartClient;
        this.sellerClient = sellerClient;
        this.deliveryClient = deliveryClient;
        this.commissionClient = commissionClient;
        this.paymentClient = paymentClient;
        this.foodClient = foodClient;
        this.notificationClient = notificationClient;
    }

    @Transactional
    public List<OrderResponse> placeOrders(Long customerId, String jwtToken, PlaceOrderRequest req) {
        CartInfo cart = cartClient.getCart(jwtToken);
        if (cart == null || cart.getSellerGroups() == null || cart.getSellerGroups().isEmpty()) {
            throw new RuntimeException("Cart is empty");
        }

        for (SellerCartGroupInfo group : cart.getSellerGroups()) {
            for (CartItemInfo ci : group.getItems()) {
                foodClient.assertStock(ci.getFoodId(), ci.getQuantity(), jwtToken);
            }
        }

        List<OrderResponse> results = new ArrayList<>();

        for (SellerCartGroupInfo group : cart.getSellerGroups()) {
            BigDecimal foodSubtotal = group.getSellerSubtotal();
            BigDecimal commission = foodSubtotal.multiply(COMMISSION_RATE).setScale(2, RoundingMode.HALF_UP);
            BigDecimal sellerEarnings = foodSubtotal.subtract(commission);
            BigDecimal totalAmount = foodSubtotal.add(DELIVERY_FEE);

            Order order = new Order();
            order.setCustomerId(customerId);
            order.setSellerId(group.getSellerId());
            order.setOrderStatus(OrderStatus.PENDING_PAYMENT); // <-- CHANGED
            order.setPaymentStatus(OrderPaymentStatus.PENDING);
            order.setFoodSubtotal(foodSubtotal);
            order.setDeliveryFee(DELIVERY_FEE);
            order.setPlatformCommission(commission);
            order.setSellerEarnings(sellerEarnings);
            order.setTotalAmount(totalAmount);
            order.setDeliveryAddress(req.getDeliveryAddress());
            order.setDeliveryLatitude(req.getDeliveryLatitude());
            order.setDeliveryLongitude(req.getDeliveryLongitude());

            Order saved = orderRepo.save(order);

            List<OrderItem> items = new ArrayList<>();
            for (CartItemInfo ci : group.getItems()) {
                OrderItem oi = new OrderItem();
                oi.setOrderId(saved.getOrderId());
                oi.setFoodId(ci.getFoodId());
                oi.setFoodNameSnapshot(ci.getFoodName());
                oi.setQuantity(ci.getQuantity());
                oi.setPricePerItem(ci.getPrice());
                oi.setTotalPrice(ci.getLineTotal());
                items.add(itemRepo.save(oi));

                foodClient.adjustStock(ci.getFoodId(), -ci.getQuantity(), jwtToken);
            }

            deliveryClient.create(saved.getOrderId(), jwtToken);
            results.add(toResponse(saved, items));
        }

        cartClient.clearCart(jwtToken);
        return results;
    }

    @Transactional
    public OrderResponse markPaid(Long orderId) {
        Order order = orderRepo.findById(orderId).orElseThrow(() -> new RuntimeException("Order not found"));
        order.setPaymentStatus(OrderPaymentStatus.SUCCESS);
        
        if (order.getOrderStatus() == OrderStatus.PENDING_PAYMENT) {
            order.setOrderStatus(OrderStatus.PLACED); // <-- CHANGED
        }
        
        Order saved = orderRepo.save(order);
        try {
            notificationClient.sendOrderPaid(saved.getCustomerId(), orderId, null);
        } catch (Exception ignored) {}
        return toResponse(saved, itemRepo.findByOrderId(orderId));
    }

    // ... (Keep other methods: getCustomerOrders, getSellerOrders, updateStatus, etc. exactly as they were)
    public List<OrderResponse> getCustomerOrders(Long customerId) {
        return orderRepo.findByCustomerIdOrderByCreatedAtDesc(customerId).stream()
                .map(o -> toResponse(o, itemRepo.findByOrderId(o.getOrderId())))
                .collect(Collectors.toList());
    }

    public List<OrderResponse> getSellerOrders(Long sellerId) {
        return orderRepo.findBySellerIdOrderByCreatedAtDesc(sellerId).stream()
                .filter(o -> o.getPaymentStatus() != OrderPaymentStatus.PENDING)
                .map(o -> toResponse(o, itemRepo.findByOrderId(o.getOrderId())))
                .collect(Collectors.toList());
    }

    @Transactional
    public OrderResponse updateStatus(Long orderId, Long userId, String role, OrderStatus newStatus, String jwtToken) {
        Order order = orderRepo.findById(orderId).orElseThrow(() -> new RuntimeException("Order not found"));
        boolean isAdmin = "ADMIN".equals(role);
        boolean isSeller = false;
        if ("SELLER".equals(role)) {
            Long sellerId = sellerClient.getSellerIdByAuthUserId(userId, jwtToken);
            isSeller = sellerId != null && order.getSellerId().equals(sellerId);
        }
        if (!isAdmin && !isSeller) throw new RuntimeException("Not allowed");
        if (isSeller && order.getPaymentStatus() == OrderPaymentStatus.PENDING) {
            throw new RuntimeException("Cannot process order — payment not yet received");
        }
        OrderStatus current = order.getOrderStatus();
        if (!isValidTransition(current, newStatus)) throw new RuntimeException("Invalid status transition");
        
        order.setOrderStatus(newStatus);
        Order saved = orderRepo.save(order);
        if (newStatus == OrderStatus.OUT_FOR_DELIVERY) deliveryClient.generateOtp(orderId, jwtToken);
        return toResponse(saved, itemRepo.findByOrderId(orderId));
    }

    @Transactional
    public OrderResponse verifyDelivery(Long orderId, Long userId, String role, String otp, String jwtToken) {
        Order order = orderRepo.findById(orderId).orElseThrow(() -> new RuntimeException("Order not found"));
        if (!"SELLER".equals(role) && !"ADMIN".equals(role)) throw new RuntimeException("Only sellers");
        if ("SELLER".equals(role)) {
            Long sellerId = sellerClient.getSellerIdByAuthUserId(userId, jwtToken);
            if (sellerId == null || !order.getSellerId().equals(sellerId)) throw new RuntimeException("Not allowed");
        }
        if (order.getOrderStatus() != OrderStatus.OUT_FOR_DELIVERY && order.getOrderStatus() != OrderStatus.OTP_VERIFICATION) throw new RuntimeException("Not out for delivery");
        
        try { deliveryClient.verifyOtp(orderId, otp, jwtToken); } catch (Exception e) { throw new RuntimeException("Invalid OTP"); }

        order.setOrderStatus(OrderStatus.DELIVERED);
        Order saved = orderRepo.save(order);
        commissionClient.record(orderId, order.getSellerId(), order.getFoodSubtotal(), order.getPlatformCommission(), order.getSellerEarnings(), jwtToken);
        return toResponse(saved, itemRepo.findByOrderId(orderId));
    }

    public OrderResponse getById(Long orderId, Long userId, String role, String jwtToken) {
        Order order = orderRepo.findById(orderId).orElseThrow(() -> new RuntimeException("Order not found"));
        boolean isAdmin = "ADMIN".equals(role);
        boolean isCustomer = "CUSTOMER".equals(role) && order.getCustomerId().equals(userId);
        boolean isSeller = false;
        if ("SELLER".equals(role)) {
            Long sellerId = sellerClient.getSellerIdByAuthUserId(userId, jwtToken);
            isSeller = sellerId != null && order.getSellerId().equals(sellerId);
        }
        if (!isAdmin && !isCustomer && !isSeller) throw new RuntimeException("Not allowed");
        return toResponse(order, itemRepo.findByOrderId(orderId));
    }

    public Map<String, Object> viewOtp(Long orderId, Long userId, String role, String jwtToken) {
        Order order = orderRepo.findById(orderId).orElseThrow(() -> new RuntimeException("Order not found"));
        boolean isAdmin = "ADMIN".equals(role);
        boolean isCustomer = "CUSTOMER".equals(role) && order.getCustomerId().equals(userId);
        if (!isAdmin && !isCustomer) throw new RuntimeException("Not allowed");
        OrderStatus status = order.getOrderStatus();
        if (status != OrderStatus.OUT_FOR_DELIVERY && status != OrderStatus.OTP_VERIFICATION && status != OrderStatus.READY) throw new RuntimeException("OTP not available");
        return deliveryClient.viewOtp(orderId, jwtToken);
    }

    @Transactional
    public OrderResponse cancel(Long orderId, Long userId, String role) {
        Order order = orderRepo.findById(orderId).orElseThrow(() -> new RuntimeException("Order not found"));
        boolean isAdmin = "ADMIN".equals(role);
        boolean isCustomer = "CUSTOMER".equals(role) && order.getCustomerId().equals(userId);
        if (!isAdmin && !isCustomer) throw new RuntimeException("Not allowed");
        if (order.getOrderStatus() != OrderStatus.PLACED && order.getOrderStatus() != OrderStatus.ACCEPTED) throw new RuntimeException("Cannot cancel");
        return doCancel(order);
    }

    public List<OrderResponse> listAllOrders() {
        return orderRepo.findAllByOrderByCreatedAtDesc().stream().map(o -> toResponse(o, itemRepo.findByOrderId(o.getOrderId()))).collect(Collectors.toList());
    }

    @Transactional
    public OrderResponse adminCancel(Long orderId) {
        Order order = orderRepo.findById(orderId).orElseThrow(() -> new RuntimeException("Order not found"));
        if (order.getOrderStatus() == OrderStatus.DELIVERED) throw new RuntimeException("Cannot cancel");
        if (order.getOrderStatus() == OrderStatus.CANCELLED) throw new RuntimeException("Already cancelled");
        return doCancel(order);
    }

    private OrderResponse doCancel(Order order) {
        List<OrderItem> items = itemRepo.findByOrderId(order.getOrderId());
        for (OrderItem it : items) foodClient.adjustStock(it.getFoodId(), it.getQuantity(), null);
        order.setOrderStatus(OrderStatus.CANCELLED);
        if (order.getPaymentStatus() == OrderPaymentStatus.SUCCESS) {
            boolean ok = paymentClient.refundOrder(order.getOrderId(), null);
            if (ok) order.setPaymentStatus(OrderPaymentStatus.REFUNDED);
        }
        Order saved = orderRepo.save(order);
        if (saved.getPaymentStatus() == OrderPaymentStatus.REFUNDED) notificationClient.sendRefund(saved.getCustomerId(), saved.getOrderId(), saved.getTotalAmount(), null);
        return toResponse(saved, items);
    }

    @Transactional
    public OrderResponse adminForceDeliver(Long orderId, String jwtToken) {
        Order order = orderRepo.findById(orderId).orElseThrow(() -> new RuntimeException("Order not found"));
        if (order.getOrderStatus() == OrderStatus.DELIVERED) throw new RuntimeException("Already delivered");
        if (order.getOrderStatus() == OrderStatus.CANCELLED) throw new RuntimeException("Cancelled");
        order.setOrderStatus(OrderStatus.DELIVERED);
        if (order.getPaymentStatus() == OrderPaymentStatus.PENDING) order.setPaymentStatus(OrderPaymentStatus.SUCCESS);
        Order saved = orderRepo.save(order);
        try { deliveryClient.updateStatus(orderId, "DELIVERED", jwtToken); } catch (Exception ignored) {}
        try { commissionClient.record(orderId, order.getSellerId(), order.getFoodSubtotal(), order.getPlatformCommission(), order.getSellerEarnings(), jwtToken); } catch (Exception ignored) {}
        return toResponse(saved, itemRepo.findByOrderId(orderId));
    }

    private boolean isValidTransition(OrderStatus from, OrderStatus to) {
        if (to == OrderStatus.CANCELLED) return from == OrderStatus.PLACED || from == OrderStatus.ACCEPTED;
        return switch (from) {
            case PLACED -> to == OrderStatus.ACCEPTED;
            case ACCEPTED -> to == OrderStatus.PREPARING;
            case PREPARING -> to == OrderStatus.READY;
            case READY -> to == OrderStatus.OUT_FOR_DELIVERY;
            case OUT_FOR_DELIVERY -> to == OrderStatus.OTP_VERIFICATION || to == OrderStatus.DELIVERED;
            case OTP_VERIFICATION -> to == OrderStatus.DELIVERED;
            default -> false;
        };
    }

    private OrderResponse toResponse(Order o, List<OrderItem> items) {
        List<OrderItemResponse> itemResponses = items.stream().map(OrderItemResponse::from).collect(Collectors.toList());
        return OrderResponse.from(o, itemResponses);
    }
}