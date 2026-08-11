/*
 * File Path: health-club-api/src/main/java/com/healthclub/api/controller/TrainerController.java
 * Controller: TrainerController (Base Endpoint Path: /api/trainers)
 * Easy Explanation: Spring Boot REST Controller managing personal trainer profile retrieval, creation, updates, and removal.
 */
package com.healthclub.api.controller;

import com.healthclub.api.dto.ApiResponse;
import com.healthclub.api.dto.TrainerDtos.TrainerRequestDto;
import com.healthclub.api.dto.TrainerDtos.TrainerResponse;
import com.healthclub.api.service.TrainerService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/trainers")
@SecurityRequirement(name = "Bearer Authentication")
public class TrainerController {
    private final TrainerService service;

    public TrainerController(TrainerService service) {
        this.service = service;
    }

    @GetMapping
    public ApiResponse<List<TrainerResponse>> all() {
        return ApiResponse.success("Trainer profiles retrieved successfully.", service.findAll());
    }

    @GetMapping("/{id}")
    public ApiResponse<TrainerResponse> one(@PathVariable("id") Long id) {
        return ApiResponse.success("Trainer profile retrieved successfully.", service.findById(id));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<TrainerResponse> create(@RequestBody TrainerRequestDto request) {
        TrainerResponse created = service.create(request);
        return ApiResponse.created("Trainer profile created successfully.", created);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<TrainerResponse> update(@PathVariable("id") Long id, @RequestBody TrainerRequestDto request) {
        TrainerResponse updated = service.update(id, request);
        return ApiResponse.updated("Trainer profile updated successfully.", updated);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ApiResponse<Void> delete(@PathVariable("id") Long id) {
        service.delete(id);
        return ApiResponse.deleted("Trainer profile with ID " + id + " deleted successfully.");
    }
}
