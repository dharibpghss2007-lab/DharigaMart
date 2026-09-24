package com.dharigamart.dto;

import com.dharigamart.entity.Product;

import java.math.BigDecimal;

public record OrderItemRequest(
        Long productId,
        Integer quantity,
        String name,
        BigDecimal price,
        BigDecimal subtotal) {

    public static OrderItemRequest from(Product product, Integer quantity) {
        BigDecimal price = product.getPrice();
        return new OrderItemRequest(
                product.getId(),
                quantity,
                product.getName(),
                price,
                price.multiply(BigDecimal.valueOf(quantity)));
    }
}