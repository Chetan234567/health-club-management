/*
 * File Path: health-club-api/src/main/java/com/healthclub/api/dto/TrainerDtos.java
 * Description: Data Transfer Objects for personal trainer profile requests and responses.
 */
package com.healthclub.api.dto;

public class TrainerDtos {
    public record TrainerRequestDto(
        String fullName,
        String email,
        String phone,
        String password,
        String specialty,
        String bio,
        String experience,
        Integer experienceYears,
        String certifications,
        Integer sessions,
        Double rating
    ) {}

    public record TrainerResponse(
        Long id,
        Long userId,
        String name,
        String email,
        String phone,
        String specialty,
        String experience,
        String certifications,
        Integer sessions,
        Double rating,
        Integer activeClients
    ) {}
}
