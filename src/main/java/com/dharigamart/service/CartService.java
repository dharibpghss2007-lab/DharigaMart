package com.dharigamart.service;

import com.dharigamart.dto.CartItemDto;
import com.dharigamart.entity.CartItem;
import com.dharigamart.entity.Product;
import com.dharigamart.entity.User;
import com.dharigamart.exception.ApiException;
import com.dharigamart.repository.CartItemRepository;
import com.dharigamart.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

/**
 * Server-side cart persisted in MySQL ("cart_items" table).
 * Fully visible through MySQL Workbench.
 */
@Service
@RequiredArgsConstructor
public class CartService {

    private final CartItemRepository cartItemRepository;
    private final UserRepository userRepository;
    private final ProductService productService;

    @Transactional(readOnly = true)
    public List<CartItemDto> getCart(Long userId) {
        return cartItemRepository.findByUserIdOrderByIdAsc(userId).stream()
                .map(c -> toDto(c.getProduct(), c.getQuantity()))
                .toList();
    }

    @Transactional
    public CartItemDto addToCart(Long userId, Long productId, Integer quantity) {
        Product product = productService.getEntity(productId);
        if (quantity <= 0) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Quantity must be at least 1");
        }
        if (quantity > product.getStock()) {
            throw new ApiException(HttpStatus.BAD_REQUEST,
                    "Only " + product.getStock() + " units available in stock.");
        }

        CartItem cartItem = cartItemRepository.findByUserIdAndProductId(userId, productId)
                .orElseGet(() -> {
                    CartItem newItem = new CartItem();
                    User user = userRepository.findById(userId)
                            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));
                    newItem.setUser(user);
                    newItem.setProduct(product);
                    return newItem;
                });

        int newQty = cartItem.getQuantity() == null ? quantity : cartItem.getQuantity() + quantity;
        if (newQty > product.getStock()) {
            throw new ApiException(HttpStatus.BAD_REQUEST,
                    "Cannot add more than " + product.getStock() + " units of this product.");
        }
        cartItem.setQuantity(newQty);
        return toDto(product, cartItemRepository.save(cartItem).getQuantity());
    }

    @Transactional
    public CartItemDto updateQuantity(Long userId, Long productId, Integer quantity) {
        Product product = productService.getEntity(productId);
        CartItem cartItem = cartItemRepository.findByUserIdAndProductId(userId, productId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Item is not in your cart"));

        if (quantity <= 0) {
            removeFromCart(userId, productId);
            return toDto(product, 0);
        }
        if (quantity > product.getStock()) {
            throw new ApiException(HttpStatus.BAD_REQUEST,
                    "Only " + product.getStock() + " units available in stock.");
        }
        cartItem.setQuantity(quantity);
        cartItemRepository.save(cartItem);
        return toDto(product, quantity);
    }

    @Transactional
    public void removeFromCart(Long userId, Long productId) {
        cartItemRepository.findByUserIdAndProductId(userId, productId)
                .ifPresent(cartItemRepository::delete);
    }

    @Transactional
    public void clearCart(Long userId) {
        cartItemRepository.deleteByUserId(userId);
    }

    @Transactional(readOnly = true)
    public int getCartCount(Long userId) {
        return cartItemRepository.sumQuantityByUserId(userId);
    }

    @Transactional(readOnly = true)
    public boolean isEmpty(Long userId) {
        return getCart(userId).isEmpty();
    }

    private CartItemDto toDto(Product product, Integer quantity) {
        BigDecimal subtotal = product.getPrice().multiply(BigDecimal.valueOf(quantity));
        return new CartItemDto(
                product.getId(),
                product.getName(),
                product.getImageUrl(),
                product.getPrice(),
                quantity,
                subtotal,
                product.getStock());
    }
}