/*
 * File Path: health-club-api/src/main/java/com/healthclub/api/service/TrainerRequestService.java
 * Service: TrainerRequestService
 * Description: Service managing member trainer requests, acceptance/rejection status updates, and trainer assignment creation.
 */
package com.healthclub.api.service;

import com.healthclub.api.dto.TrainerRequestDtos.CreateTrainerRequest;
import com.healthclub.api.dto.TrainerRequestDtos.TrainerRequestResponse;
import com.healthclub.api.exception.ResourceNotFoundException;
import com.healthclub.api.model.MemberProfile;
import com.healthclub.api.model.RequestStatus;
import com.healthclub.api.model.TrainerAssignment;
import com.healthclub.api.model.TrainerProfile;
import com.healthclub.api.model.TrainerRequest;
import com.healthclub.api.repository.TrainerAssignmentRepository;
import com.healthclub.api.repository.TrainerRequestRepository;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TrainerRequestService {
    private final MemberService memberService;
    private final TrainerAssignmentRepository assignmentRepository;
    private final TrainerRequestRepository requestRepository;
    private final TrainerService trainerService;
    private static final DateTimeFormatter FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd hh:mm a");

    public TrainerRequestService(MemberService memberService, TrainerAssignmentRepository assignmentRepository, TrainerRequestRepository requestRepository, TrainerService trainerService) {
        this.memberService = memberService;
        this.assignmentRepository = assignmentRepository;
        this.requestRepository = requestRepository;
        this.trainerService = trainerService;
    }

    public List<TrainerRequestResponse> findAll() {
        return requestRepository.findAll().stream().map(this::toResponse).toList();
    }

    @Transactional
    public TrainerRequestResponse create(CreateTrainerRequest request) {
        TrainerRequest trainerRequest = new TrainerRequest();

        if (request.memberId() != null) {
            trainerRequest.setMember(memberService.get(request.memberId()));
        } else if (request.memberName() != null) {
            MemberProfile m = memberService.findAll().stream()
                .filter(mp -> mp.name().equalsIgnoreCase(request.memberName()))
                .findFirst()
                .map(mp -> memberService.get(mp.id()))
                .orElse(null);
            if (m != null) trainerRequest.setMember(m);
        }

        if (request.trainerId() != null) {
            trainerRequest.setTrainer(trainerService.get(request.trainerId()));
        } else if (request.trainerName() != null) {
            TrainerProfile t = trainerService.findAll().stream()
                .filter(tp -> tp.name().equalsIgnoreCase(request.trainerName()))
                .findFirst()
                .map(tp -> trainerService.get(tp.id()))
                .orElse(null);
            if (t != null) trainerRequest.setTrainer(t);
        }

        trainerRequest.setGoal(request.goal());
        trainerRequest.setRequestedAt(LocalDateTime.now());
        return toResponse(requestRepository.save(trainerRequest));
    }

    @Transactional
    public TrainerRequestResponse updateStatus(Long requestId, String statusStr) {
        TrainerRequest trainerRequest = requestRepository.findById(requestId).orElseThrow(() -> new ResourceNotFoundException("Trainer request not found"));
        RequestStatus status = RequestStatus.valueOf(statusStr.toUpperCase());
        trainerRequest.setStatus(status);
        trainerRequest.setDecidedAt(LocalDateTime.now());

        if (status == RequestStatus.ACCEPTED && trainerRequest.getMember() != null && trainerRequest.getTrainer() != null) {
            MemberProfile member = trainerRequest.getMember();
            TrainerProfile trainer = trainerRequest.getTrainer();
            member.setTrainerName(trainer.getUser().getFullName());

            TrainerAssignment assignment = new TrainerAssignment();
            assignment.setMember(member);
            assignment.setTrainer(trainer);
            assignmentRepository.save(assignment);
        }
        return toResponse(trainerRequest);
    }

    public TrainerRequestResponse toResponse(TrainerRequest request) {
        String memberName = request.getMember() != null ? request.getMember().getUser().getFullName() : "Member";
        String trainerName = request.getTrainer() != null ? request.getTrainer().getUser().getFullName() : "Trainer";
        String statusStr = request.getStatus() != null ? capitalize(request.getStatus().name()) : "Pending";
        String reqAt = request.getRequestedAt() != null ? request.getRequestedAt().format(FORMATTER) : "";
        String decAt = request.getDecidedAt() != null ? request.getDecidedAt().format(FORMATTER) : "";

        return new TrainerRequestResponse(
            request.getId(),
            memberName,
            trainerName,
            request.getGoal(),
            statusStr,
            reqAt,
            decAt
        );
    }

    private String capitalize(String text) {
        if (text == null || text.isEmpty()) return text;
        return text.substring(0, 1).toUpperCase() + text.substring(1).toLowerCase();
    }
}
