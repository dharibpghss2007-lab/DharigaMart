package com.dharigamart.service;

import com.dharigamart.dto.AuthResponse;
import com.dharigamart.dto.LoginRequest;
import com.dharigamart.dto.RegisterRequest;
import com.dharigamart.entity.User;
import com.dharigamart.exception.ApiException;
import com.dharigamart.repository.UserRepository;
import com.dharigamart.security.JwtService;
import com.dharigamart.dto.UserDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public UserDto register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email().toLowerCase().trim())) {
            throw new ApiException(HttpStatus.CONFLICT, "An account already exists with this email.");
        }
        if (!request.password().equals(request.confirmPassword())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Password and confirm password do not match.");
        }

        User user = new User(
                request.name().trim(),
                request.phone().trim(),
                request.email().toLowerCase().trim(),
                passwordEncoder.encode(request.password()));
        User saved = userRepository.save(user);
        return new UserDto(saved.getId(), saved.getName(), saved.getPhone(), saved.getEmail());
    }

    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.email().toLowerCase().trim(), request.password()));

        User user = userRepository.findByEmail(request.email().toLowerCase().trim())
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Invalid email or password"));

        String token = jwtService.generateToken(user);
        return new AuthResponse(token,
                new UserDto(user.getId(), user.getName(), user.getPhone(), user.getEmail()),
                "Login successful");
    }

    public UserDto getProfile(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));
        return new UserDto(user.getId(), user.getName(), user.getPhone(), user.getEmail());
    }
}