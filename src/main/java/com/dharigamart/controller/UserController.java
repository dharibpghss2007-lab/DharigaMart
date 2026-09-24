package com.dharigamart.controller;

import com.dharigamart.dto.UserDto;
import com.dharigamart.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final AuthService authService;

    @GetMapping("/me")
    public UserDto getProfile(Authentication authentication) {
        return authService.getProfile(authentication.getName());
    }
}