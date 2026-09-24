package com.dharigamart.controller;

import com.dharigamart.dto.ProductDto;
import com.dharigamart.service.ProductService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ProductController {

    private final ProductService productService;

    // GET /api/products?search=&category=&sort=asc|desc
    @GetMapping("/products")
    public List<ProductDto> getAll(@RequestParam(required = false) String search,
                                   @RequestParam(required = false) String category,
                                   @RequestParam(required = false) String sort) {
        return productService.getAll(search, category, sort);
    }

    @GetMapping("/products/{id}")
    public ProductDto getById(@PathVariable Long id) {
        return productService.getById(id);
    }

    @GetMapping("/categories")
    public List<String> getCategories() {
        return productService.getCategories();
    }

    @PostMapping("/products")
    public ResponseEntity<ProductDto> create(@RequestBody ProductDto product) {
        return ResponseEntity.status(HttpStatus.CREATED).body(productService.create(product));
    }

    @PutMapping("/products/{id}")
    public ResponseEntity<ProductDto> update(@PathVariable Long id, @RequestBody ProductDto product) {
        return ResponseEntity.ok(productService.update(id, product));
    }

    @DeleteMapping("/products/{id}")
    public ResponseEntity<Map<String, String>> delete(@PathVariable Long id) {
        productService.delete(id);
        return ResponseEntity.ok(Map.of("message", "Product deleted successfully"));
    }
}