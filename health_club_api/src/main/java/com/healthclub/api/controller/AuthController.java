/*
 * File Path: health-club-api/src/main/java/com/healthclub/api/controller/AuthController.java
 * Controller: AuthController (Base Endpoint Path: /api/auth)
 * Easy Explanation: Spring Boot REST Controller that handles user login authentication, account signups, and password resets.
 */
package com.healthclub.api.controller;

import com.healthclub.api.dto.AuthDtos.AuthResponse;
import com.healthclub.api.dto.AuthDtos.LoginRequest;
import com.healthclub.api.dto.AuthDtos.RegisterRequest;
import com.healthclub.api.dto.AuthDtos.ResetPasswordRequest;
import com.healthclub.api.service.AuthService;
import jakarta.validation.Valid;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    private final AuthService authService;

    // Constructor Dependency Injection for AuthService
    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /**
     * Endpoint: POST /api/auth/login
     * Easy Explanation: Authenticates a user by email & password and returns a JWT Bearer security token.
     * Inputs: LoginRequest JSON object (email, password, role)
     * Output: AuthResponse JSON object (token, email, fullName, roles)
     */
    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    /**
     * Endpoint: POST /api/auth/register
     * Easy Explanation: Registers a new user account and automatically provisions a Member or Trainer profile.
     * Inputs: RegisterRequest JSON object (fullName, email, password, phone, role)
     * Output: AuthResponse JSON object with new JWT token
     */
    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody RegisterRequest request) {
        authService.register(request);
        return ResponseEntity.ok("Registration Successful");
    }
    /**
     * Endpoint: POST /api/auth/reset-password
     * Easy Explanation: Resets a user password by email.
     * Inputs: ResetPasswordRequest JSON object (role, email, password)
     * Output: JSON map containing success boolean and confirmation message
     */
    @PostMapping("/reset-password")
    public Map<String, Object> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        boolean success = authService.resetPassword(request);
        return Map.of("success", success, "message", "Password reset successfully");
    }
}
