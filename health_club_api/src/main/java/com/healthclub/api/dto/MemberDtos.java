/*
 * File Path: health-club-api/src/main/java/com/healthclub/api/dto/MemberDtos.java
 * Description: Data Transfer Objects for member management, plan purchases, and workout/diet routine updates.
 */
package com.healthclub.api.dto;

import java.time.LocalDate;
import java.util.Map;

public class MemberDtos {
    public record MemberRequest(
        String fullName,
        String email,
        String phone,
        String password,
        String plan,
        String trainer,
        String renewal,
        String status,
        String gender,
        String address,
        String emergencyContact,
        String healthGoal,
        String dateOfBirth
    ) {}

    public record WorkoutPlanUpdateRequest(
        String memberName,
        String dayKey,
        Object dayPlan
    ) {}

    public record DietPlanUpdateRequest(
        String memberName,
        Object dietPlan
    ) {}

    public record PurchasePlanRequest(
        String planName,
        String price,
        String duration
    ) {}

    public record MemberResponse(
        Long id,
        Long userId,
        String name,
        String email,
        String phone,
        String plan,
        String trainer,
        String renewal,
        String status,
        String healthGoal,
        String gender,
        String address,
        String emergencyContact,
        String dateOfBirth,
        Object workoutPlan,
        Object dietPlan
    ) {}
}
