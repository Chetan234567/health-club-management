/*
 * File Path: health-club-api/src/main/java/com/healthclub/api/controller/TrainerRequestController.java
 * Controller: TrainerRequestController (Base Endpoint Path: /api/trainer-requests)
 * Easy Explanation: Spring Boot REST Controller handling member requests for personal trainers and trainer accept/reject status updates.
 */
package com.healthclub.api.controller;

import com.healthclub.api.dto.TrainerRequestDtos.CreateTrainerRequest;
import com.healthclub.api.dto.TrainerRequestDtos.TrainerRequestResponse;
import com.healthclub.api.dto.TrainerRequestDtos.UpdateTrainerRequestStatus;
import com.healthclub.api.service.TrainerRequestService;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/trainer-requests")
public class TrainerRequestController {
    private final TrainerRequestService service;

    // Constructor Dependency Injection for TrainerRequestService
    public TrainerRequestController(TrainerRequestService service) {
        this.service = service;
    }

    /**
     * Endpoint: GET /api/trainer-requests
     * Easy Explanation: Retrieves all member requests asking for personal trainers.
     * Output: List of TrainerRequestResponse JSON objects
     */
    @GetMapping
    public List<TrainerRequestResponse> all() {
        return service.findAll();
    }

    /**
     * Endpoint: POST /api/trainer-requests
     * Easy Explanation: Submits a new member request asking for a personal trainer.
     * Inputs: CreateTrainerRequest JSON object (memberId, trainerId, goal)
     * Output: Newly created TrainerRequestResponse JSON object (HTTP 201 Created)
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public TrainerRequestResponse create(@RequestBody CreateTrainerRequest request) {
        return service.create(request);
    }

    /**
     * Endpoint: PUT /api/trainer-requests/{id}/status
     * Easy Explanation: Allows a trainer to accept or reject a member's request.
     * Inputs: Path variable 'id' (Long), UpdateTrainerRequestStatus JSON object (status: 'ACCEPTED' | 'REJECTED')
     * Output: Updated TrainerRequestResponse JSON object
     */
    @PutMapping("/{id}/status")
    public TrainerRequestResponse status(@PathVariable("id") Long id, @RequestBody UpdateTrainerRequestStatus request) {
        return service.updateStatus(id, request.status());
    }
}
