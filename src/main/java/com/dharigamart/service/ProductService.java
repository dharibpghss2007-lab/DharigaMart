package com.dharigamart.service;

import com.dharigamart.dto.ProductDto;
import com.dharigamart.entity.Product;
import com.dharigamart.exception.ApiException;
import com.dharigamart.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;

    public List<ProductDto> getAll(String search, String category, String sort) {
        List<Product> products;
        if (category != null && !category.isBlank()) {
            products = productRepository.findByCategoryIgnoreCase(category.trim());
        } else {
            products = productRepository.findAll();
        }

        if (search != null && !search.isBlank()) {
            String term = search.trim().toLowerCase(Locale.ROOT);
            products = products.stream()
                    .filter(p -> p.getName().toLowerCase(Locale.ROOT).contains(term)
                            || (p.getDescription() != null
                                && p.getDescription().toLowerCase(Locale.ROOT).contains(term)))
                    .toList();
        }

        if ("asc".equalsIgnoreCase(sort)) {
            products = products.stream()
                    .sorted(Comparator.comparing(Product::getPrice))
                    .toList();
        } else if ("desc".equalsIgnoreCase(sort)) {
            products = products.stream()
                    .sorted(Comparator.comparing(Product::getPrice).reversed())
                    .toList();
        }

        return products.stream().map(this::toDto).toList();
    }

    public ProductDto getById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Product not found with id: " + id));
        return toDto(product);
    }

    public Product getEntity(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Product not found with id: " + id));
    }

    public ProductDto create(ProductDto dto) {
        Product product = new Product();
        apply(product, dto);
        return toDto(productRepository.save(product));
    }

    public ProductDto update(Long id, ProductDto dto) {
        Product product = getEntity(id);
        apply(product, dto);
        return toDto(productRepository.save(product));
    }

    public void delete(Long id) {
        Product product = getEntity(id);
        productRepository.delete(product);
    }

    public List<String> getCategories() {
        return productRepository.findDistinctCategories();
    }

    private void apply(Product product, ProductDto dto) {
        if (dto.name() != null) product.setName(dto.name());
        if (dto.description() != null) product.setDescription(dto.description());
        if (dto.category() != null) product.setCategory(dto.category());
        if (dto.price() != null) product.setPrice(dto.price());
        if (dto.stock() != null) product.setStock(dto.stock());
        if (dto.rating() != null) product.setRating(dto.rating());
        if (dto.imageUrl() != null) product.setImageUrl(dto.imageUrl());
    }

    private ProductDto toDto(Product p) {
        return new ProductDto(
                p.getId(),
                p.getName(),
                p.getDescription(),
                p.getCategory(),
                p.getPrice(),
                p.getStock(),
                p.getRating() == null ? BigDecimal.valueOf(4.0) : p.getRating(),
                p.getImageUrl());
    }
}