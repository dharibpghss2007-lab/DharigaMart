package com.dharigamart.dto;

public record AuthResponse(String token, UserDto user, String message) {
}