package com.dharigamart.dto;

import java.math.BigDecimal;

public record ProductDto(
        Long id,
        String name,
        String description,
        String category,
        BigDecimal price,
        Integer stock,
        BigDecimal rating,
        String imageUrl) {
}