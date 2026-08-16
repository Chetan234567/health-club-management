/*
 * File Path: health-club-api/src/main/java/com/healthclub/api/controller/DashboardController.java
 * Controller: DashboardController (Base Endpoint Path: /api/admin/dashboard)
 * Easy Explanation: Spring Boot REST Controller returning aggregate system metrics (total members, active trainers, active plans) for Admin Dashboard.
 */
package com.healthclub.api.controller;

import com.healthclub.api.repository.MemberProfileRepository;
import com.healthclub.api.repository.MembershipPlanRepository;
import com.healthclub.api.repository.TrainerProfileRepository;
import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/admin/dashboard")
public class DashboardController {
    private final MemberProfileRepository memberRepository;
    private final MembershipPlanRepository planRepository;
    private final TrainerProfileRepository trainerRepository;

    // Constructor Dependency Injection for Repositories
    public DashboardController(MemberProfileRepository memberRepository, MembershipPlanRepository planRepository, TrainerProfileRepository trainerRepository) {
        this.memberRepository = memberRepository;
        this.planRepository = planRepository;
        this.trainerRepository = trainerRepository;
    }

    /**
     * Endpoint: GET /api/admin/dashboard
     * Easy Explanation: Calculates and returns high-level executive dashboard numbers (total count of members, trainers, and plans).
     * Output: JSON map containing "members", "trainers", and "plans" counts
     */
    @GetMapping
    public Map<String, Object> summary() {
        return Map.of(
            "members", memberRepository.count(),
            "trainers", trainerRepository.count(),
            "plans", planRepository.count()
        );
    }
}
