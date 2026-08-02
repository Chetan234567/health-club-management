/*
 * File Path: health-club-api/src/main/java/com/healthclub/api/controller/MemberController.java
 * Controller: MemberController (Base Endpoint Path: /api/members)
 * Easy Explanation: Spring Boot REST Controller exposing endpoints for member profile management, plan purchases, and workout/diet updates.
 */
package com.healthclub.api.controller;

import com.healthclub.api.dto.MemberDtos.DietPlanUpdateRequest;
import com.healthclub.api.dto.MemberDtos.MemberRequest;
import com.healthclub.api.dto.MemberDtos.MemberResponse;
import com.healthclub.api.dto.MemberDtos.PurchasePlanRequest;
import com.healthclub.api.dto.MemberDtos.WorkoutPlanUpdateRequest;
import com.healthclub.api.service.MemberService;
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
@RequestMapping("/api")
public class MemberController {
    private final MemberService service;

    // Constructor Dependency Injection for MemberService
    public MemberController(MemberService service) {
        this.service = service;
    }

    /**
     * Endpoint: GET /api/members
     * Easy Explanation: Retrieves a list of all active gym member profiles.
     * Output: List of MemberResponse JSON objects
     */
    @GetMapping("/members")
    public List<MemberResponse> all() {
        return service.findAll();
    }

    /**
     * Endpoint: GET /api/members/{id}
     * Easy Explanation: Retrieves details of a single gym member profile by ID.
     * Inputs: Path variable 'id' (Long)
     * Output: MemberResponse JSON object
     */
    @GetMapping("/members/{id}")
    public MemberResponse one(@PathVariable("id") Long id) {
        return service.findById(id);
    }

    /**
     * Endpoint: POST /api/members
     * Easy Explanation: Creates a new member profile record in the database.
     * Inputs: MemberRequest JSON object
     * Output: Newly created MemberResponse JSON object (HTTP 201 Created)
     */
    @PostMapping("/members")
    @ResponseStatus(HttpStatus.CREATED)
    public MemberResponse create(@RequestBody MemberRequest request) {
        return service.create(request);
    }

    /**
     * Endpoint: PUT /api/members/{id}
     * Easy Explanation: Updates an existing member profile (name, phone, plan, trainer, renewal date).
     * Inputs: Path variable 'id' (Long), MemberRequest JSON object
     * Output: Updated MemberResponse JSON object
     */
    @PutMapping("/members/{id}")
    public MemberResponse update(@PathVariable("id") Long id, @RequestBody MemberRequest request) {
        return service.update(id, request);
    }

    /**
     * Endpoint: PUT /api/members/{id}/workout-plan
     * Easy Explanation: Updates the day-by-day workout routine exercises for a member.
     * Inputs: Path variable 'id' (Long), WorkoutPlanUpdateRequest JSON object
     * Output: Updated MemberResponse JSON object
     */
    @PutMapping("/members/{id}/workout-plan")
    public MemberResponse updateWorkoutPlan(@PathVariable("id") Long id, @RequestBody WorkoutPlanUpdateRequest request) {
        return service.updateWorkoutPlan(id, request);
    }

    /**
     * Endpoint: PUT /api/members/{id}/diet-plan
     * Easy Explanation: Updates the nutrition diet schedule (breakfast, lunch, dinner, macros) for a member.
     * Inputs: Path variable 'id' (Long), DietPlanUpdateRequest JSON object
     * Output: Updated MemberResponse JSON object
     */
    @PutMapping("/members/{id}/diet-plan")
    public MemberResponse updateDietPlan(@PathVariable("id") Long id, @RequestBody DietPlanUpdateRequest request) {
        return service.updateDietPlan(id, request);
    }

    /**
     * Endpoint: POST /api/members/{id}/purchase-plan
     * Easy Explanation: Activates a new membership subscription plan for a member.
     * Inputs: Path variable 'id' (Long), PurchasePlanRequest JSON object
     * Output: Updated MemberResponse JSON object
     */
    @PostMapping("/members/{id}/purchase-plan")
    public MemberResponse purchasePlan(@PathVariable("id") Long id, @RequestBody PurchasePlanRequest request) {
        return service.purchasePlan(id, request);
    }

    /**
     * Endpoint: DELETE /api/members/{id}
     * Easy Explanation: Permanently deletes a member profile and all associated subscriptions and trainer requests.
     * Inputs: Path variable 'id' (Long)
     * Output: Void (HTTP 204 No Content)
     */
    @DeleteMapping("/members/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable("id") Long id) {
        service.delete(id);
    }
}
