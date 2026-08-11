/*
 * File Path: health-club-api/src/main/java/com/healthclub/api/dto/TrainerRequestDtos.java
 * Description: Data Transfer Objects for trainer assignment request creation and status updates.
 */
package com.healthclub.api.dto;

public class TrainerRequestDtos {
    public record CreateTrainerRequest(
        Long memberId,
        Long trainerId,
        String memberName,
        String trainerName,
        String goal
    ) {}

    public record UpdateTrainerRequestStatus(
        String status
    ) {}

    public record TrainerRequestResponse(
        Long id,
        String memberName,
        String trainerName,
        String goal,
        String status,
        String requestedAt,
        String updatedAt
    ) {}
}
