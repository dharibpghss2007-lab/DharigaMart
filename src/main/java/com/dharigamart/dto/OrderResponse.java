package com.dharigamart.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record OrderResponse(
        Long id,
        String orderNumber,
        String customerName,
        String phone,
        String email,
        String address,
        String city,
        String state,
        String pincode,
        BigDecimal subtotal,
        BigDecimal shipping,
        BigDecimal total,
        String status,
        LocalDateTime createdAt,
        List<OrderItemResponse> items) {
}