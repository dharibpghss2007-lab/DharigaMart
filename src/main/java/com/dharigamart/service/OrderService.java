package com.dharigamart.service;

import com.dharigamart.dto.CartItemDto;
import com.dharigamart.dto.OrderItemResponse;
import com.dharigamart.dto.OrderRequest;
import com.dharigamart.dto.OrderResponse;
import com.dharigamart.entity.Order;
import com.dharigamart.entity.OrderItem;
import com.dharigamart.entity.Product;
import com.dharigamart.entity.User;
import com.dharigamart.exception.ApiException;
import com.dharigamart.repository.OrderRepository;
import com.dharigamart.repository.ProductRepository;
import com.dharigamart.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.concurrent.ThreadLocalRandom;

@Service
@RequiredArgsConstructor
public class OrderService {

    private static final BigDecimal FREE_SHIPPING_THRESHOLD = BigDecimal.valueOf(999);
    private static final BigDecimal SHIPPING_FEE = BigDecimal.valueOf(49);

    private final OrderRepository orderRepository;
    private final CartService cartService;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;

    @Transactional
    public OrderResponse placeOrder(String email, OrderRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));

        List<CartItemDto> cartItems = cartService.getCart(user.getId());
        if (cartItems.isEmpty()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Your cart is empty. Add products before checkout.");
        }

        BigDecimal subtotal = cartItems.stream()
                .map(CartItemDto::subtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal shipping = subtotal.compareTo(FREE_SHIPPING_THRESHOLD) >= 0 ? BigDecimal.ZERO : SHIPPING_FEE;
        BigDecimal total = subtotal.add(shipping);

        Order order = new Order();
        order.setOrderNumber(generateOrderNumber());
        order.setUser(user);
        order.setCustomerName(request.customerName().trim());
        order.setPhone(request.phone().trim());
        order.setEmail(request.email().toLowerCase().trim());
        order.setAddress(request.address().trim());
        order.setCity(request.city().trim());
        order.setState(request.state().trim());
        order.setPincode(request.pincode().trim());
        order.setSubtotal(subtotal);
        order.setShipping(shipping);
        order.setTotal(total);
        order.setStatus("PLACED");
        order.setCreatedAt(LocalDateTime.now());

        for (CartItemDto item : cartItems) {
            Product product = productRepository.findById(item.productId())
                    .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Product not found"));

            if (product.getStock() < item.quantity()) {
                throw new ApiException(HttpStatus.BAD_REQUEST,
                        "Insufficient stock for " + product.getName() + ". Only " + product.getStock() + " left.");
            }

            OrderItem orderItem = new OrderItem();
            orderItem.setProduct(product);
            orderItem.setProductName(item.name());
            orderItem.setPrice(item.price());
            orderItem.setQuantity(item.quantity());
            orderItem.setSubtotal(item.subtotal());
            order.addItem(orderItem);

            product.setStock(product.getStock() - item.quantity());
            productRepository.save(product);
        }

        Order saved = orderRepository.save(order);
        cartService.clearCart(user.getId());
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getOrders(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));
        return orderRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream().map(this::toResponse).toList();
    }

    private String generateOrderNumber() {
        return "DM" + System.currentTimeMillis() + (100 + ThreadLocalRandom.current().nextInt(900));
    }

    private OrderResponse toResponse(Order order) {
        List<OrderItemResponse> items = order.getItems().stream()
                .map(i -> new OrderItemResponse(
                        i.getProduct() == null ? null : i.getProduct().getId(),
                        i.getProductName(),
                        i.getProduct() == null ? null : i.getProduct().getImageUrl(),
                        i.getPrice(),
                        i.getQuantity(),
                        i.getSubtotal()))
                .toList();
        return new OrderResponse(
                order.getId(),
                order.getOrderNumber(),
                order.getCustomerName(),
                order.getPhone(),
                order.getEmail(),
                order.getAddress(),
                order.getCity(),
                order.getState(),
                order.getPincode(),
                order.getSubtotal(),
                order.getShipping(),
                order.getTotal(),
                order.getStatus(),
                order.getCreatedAt(),
                items);
    }
}