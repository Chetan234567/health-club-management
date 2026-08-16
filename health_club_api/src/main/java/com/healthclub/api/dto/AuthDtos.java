/*
 * File Path: health-club-api/src/main/java/com/healthclub/api/dto/AuthDtos.java
 * Description: Data Transfer Objects for authentication (LoginRequest, RegisterRequest, ResetPasswordRequest, AuthResponse).
 */
package com.healthclub.api.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import java.util.List;

public class AuthDtos {
    public record LoginRequest(
        @NotBlank @Email String email,
        @NotBlank String password,
        String role
    ) {}

    public record RegisterRequest(
        @NotBlank String fullName,
        @NotBlank @Email String email,
        @NotBlank String password,
        String phone,
        String role,
        String specialty,
        String experience,
        String certifications
    ) {}

    public record ResetPasswordRequest(
        String role,
        @NotBlank @Email String email,
        @NotBlank String password
    ) {}

    public record AuthResponse(
        String token,
        String email,
        String fullName,
        List<String> roles
    ) {}
}
