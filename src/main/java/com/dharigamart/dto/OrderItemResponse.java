package com.dharigamart.dto;

import java.math.BigDecimal;

public record OrderItemResponse(
        Long productId,
        String name,
        String imageUrl,
        BigDecimal price,
        Integer quantity,
        BigDecimal subtotal) {
}