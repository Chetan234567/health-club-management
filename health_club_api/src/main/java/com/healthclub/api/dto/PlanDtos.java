/*
 * File Path: health-club-api/src/main/java/com/healthclub/api/dto/PlanDtos.java
 * Description: Data Transfer Objects for membership plan offerings (PlanRequest, PlanResponse).
 */
package com.healthclub.api.dto;

import java.util.List;

public class PlanDtos {
    public record PlanRequest(
        String name,
        String price,
        Double priceInr,
        String duration,
        Integer durationDays,
        String description,
        Integer members,
        List<String> features,
        Boolean active
    ) {}

    public record PlanResponse(
        Long id,
        String name,
        String price,
        String duration,
        Integer members,
        List<String> features
    ) {}
}
