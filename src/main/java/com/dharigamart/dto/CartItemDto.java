package com.dharigamart.dto;

import java.math.BigDecimal;

public record CartItemDto(
        Long productId,
        String name,
        String imageUrl,
        BigDecimal price,
        Integer quantity,
        BigDecimal subtotal,
        Integer stock) {
}