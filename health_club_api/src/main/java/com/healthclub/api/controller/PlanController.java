/*
 * File Path: health-club-api/src/main/java/com/healthclub/api/controller/PlanController.java
 * Controller: PlanController (Base Endpoint Path: /api/plans)
 * Easy Explanation: Spring Boot REST Controller handling health club membership plan creation, modifications, and deletion.
 */
package com.healthclub.api.controller;

import com.healthclub.api.dto.PlanDtos.PlanRequest;
import com.healthclub.api.dto.PlanDtos.PlanResponse;
import com.healthclub.api.service.PlanService;
import java.util.List;
import org.springframework.http.HttpStatus;
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
@RequestMapping("/api/plans")
public class PlanController {
    private final PlanService service;

    // Constructor Dependency Injection for PlanService
    public PlanController(PlanService service) {
        this.service = service;
    }

    /**
     * Endpoint: GET /api/plans
     * Easy Explanation: Retrieves all available gym membership pricing plans.
     * Output: List of PlanResponse JSON objects
     */
    @GetMapping
    public List<PlanResponse> all() {
        return service.findAll();
    }

    /**
     * Endpoint: GET /api/plans/{id}
     * Easy Explanation: Retrieves details of a single membership plan by ID.
     * Inputs: Path variable 'id' (Long)
     * Output: PlanResponse JSON object
     */
    @GetMapping("/{id}")
    public PlanResponse one(@PathVariable("id") Long id) {
        return service.findById(id);
    }

    /**
     * Endpoint: POST /api/plans
     * Easy Explanation: Creates a new membership pricing tier (name, price, duration, features list).
     * Inputs: PlanRequest JSON object
     * Output: Newly created PlanResponse JSON object (HTTP 201 Created)
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PlanResponse create(@RequestBody PlanRequest request) {
        return service.create(request);
    }

    /**
     * Endpoint: PUT /api/plans/{id}
     * Easy Explanation: Updates an existing membership plan by ID.
     * Inputs: Path variable 'id' (Long), PlanRequest JSON object
     * Output: Updated PlanResponse JSON object
     */
    @PutMapping("/{id}")
    public PlanResponse update(@PathVariable("id") Long id, @RequestBody PlanRequest request) {
        return service.update(id, request);
    }

    /**
     * Endpoint: DELETE /api/plans/{id}
     * Easy Explanation: Deletes a membership plan and unlinks active member subscriptions.
     * Inputs: Path variable 'id' (Long)
     * Output: Void (HTTP 204 No Content)
     */
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable("id") Long id) {
        service.delete(id);
    }
}
