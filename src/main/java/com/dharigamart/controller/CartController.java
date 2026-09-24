package com.dharigamart.controller;

import com.dharigamart.dto.CartItemDto;
import com.dharigamart.dto.CartRequest;
import com.dharigamart.entity.User;
import com.dharigamart.repository.UserRepository;
import com.dharigamart.service.CartService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cart")
@RequiredArgsConstructor
public class CartController {

    private final CartService cartService;
    private final UserRepository userRepository;

    @GetMapping
    public List<CartItemDto> getCart(Authentication authentication) {
        return cartService.getCart(currentUserId(authentication));
    }

    @GetMapping("/count")
    public Map<String, Integer> getCount(Authentication authentication) {
        return Map.of("count", cartService.getCartCount(currentUserId(authentication)));
    }

    @PostMapping
    public ResponseEntity<CartItemDto> addToCart(@Valid @RequestBody CartRequest request,
                                                 Authentication authentication) {
        CartItemDto item = cartService.addToCart(currentUserId(authentication),
                request.productId(), request.quantity());
        return ResponseEntity.status(HttpStatus.CREATED).body(item);
    }

    @PutMapping("/{productId}")
    public ResponseEntity<CartItemDto> updateQuantity(@PathVariable Long productId,
                                                      @RequestBody CartRequest request,
                                                      Authentication authentication) {
        CartItemDto item = cartService.updateQuantity(currentUserId(authentication),
                productId, request.quantity());
        return ResponseEntity.ok(item);
    }

    @DeleteMapping("/{productId}")
    public ResponseEntity<Map<String, String>> removeItem(@PathVariable Long productId,
                                                          Authentication authentication) {
        cartService.removeFromCart(currentUserId(authentication), productId);
        return ResponseEntity.ok(Map.of("message", "Item removed from cart"));
    }

    @DeleteMapping
    public ResponseEntity<Map<String, String>> clearCart(Authentication authentication) {
        cartService.clearCart(currentUserId(authentication));
        return ResponseEntity.ok(Map.of("message", "Cart cleared"));
    }

    private Long currentUserId(Authentication authentication) {
        String email = authentication.getName();
        return userRepository.findByEmail(email)
                .map(User::getId)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}