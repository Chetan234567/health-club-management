/*
 * File Path: health-club-api/src/main/java/com/healthclub/api/service/MemberService.java
 * Service: MemberService
 * Description: Business logic service for member profiles, subscription management, plan purchases, and JSON workout/diet routine persistence.
 */
package com.healthclub.api.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.healthclub.api.dto.MemberDtos.DietPlanUpdateRequest;
import com.healthclub.api.dto.MemberDtos.MemberRequest;
import com.healthclub.api.dto.MemberDtos.MemberResponse;
import com.healthclub.api.dto.MemberDtos.PurchasePlanRequest;
import com.healthclub.api.dto.MemberDtos.WorkoutPlanUpdateRequest;
import com.healthclub.api.exception.ResourceNotFoundException;
import com.healthclub.api.exception.SubscriptionConflictException;
import com.healthclub.api.model.MemberProfile;
import com.healthclub.api.model.MemberSubscription;
import com.healthclub.api.model.MembershipPlan;
import com.healthclub.api.model.Role;
import com.healthclub.api.model.RoleName;
import com.healthclub.api.model.SubscriptionStatus;
import com.healthclub.api.model.TrainerAssignment;
import com.healthclub.api.model.TrainerRequest;
import com.healthclub.api.model.User;
import com.healthclub.api.repository.MemberProfileRepository;
import com.healthclub.api.repository.MemberSubscriptionRepository;
import com.healthclub.api.repository.MembershipPlanRepository;
import com.healthclub.api.repository.RoleRepository;
import com.healthclub.api.repository.TrainerAssignmentRepository;
import com.healthclub.api.repository.TrainerRequestRepository;
import com.healthclub.api.repository.UserRepository;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.Map;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class MemberService {
    private final MemberProfileRepository memberRepository;
    private final MemberSubscriptionRepository subscriptionRepository;
    private final MembershipPlanRepository planRepository;
    private final PasswordEncoder passwordEncoder;
    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final TrainerAssignmentRepository assignmentRepository;
    private final TrainerRequestRepository requestRepository;
    private final ObjectMapper objectMapper;

    public MemberService(
        MemberProfileRepository memberRepository,
        MemberSubscriptionRepository subscriptionRepository,
        MembershipPlanRepository planRepository,
        PasswordEncoder passwordEncoder,
        RoleRepository roleRepository,
        UserRepository userRepository,
        TrainerAssignmentRepository assignmentRepository,
        TrainerRequestRepository requestRepository,
        ObjectMapper objectMapper
    ) {
        this.memberRepository = memberRepository;
        this.subscriptionRepository = subscriptionRepository;
        this.planRepository = planRepository;
        this.passwordEncoder = passwordEncoder;
        this.roleRepository = roleRepository;
        this.userRepository = userRepository;
        this.assignmentRepository = assignmentRepository;
        this.requestRepository = requestRepository;
        this.objectMapper = objectMapper;
    }

    public List<MemberResponse> findAll() {
        return memberRepository.findAll().stream().map(this::toResponse).toList();
    }

    public MemberResponse findById(Long id) {
        return toResponse(get(id));
    }

    @Transactional
    public MemberResponse create(MemberRequest request) {
        Role role = roleRepository.findByName(RoleName.MEMBER).orElseThrow(() -> new ResourceNotFoundException("Role not found"));
        User user = new User();
        user.setFullName(request.fullName() != null ? request.fullName() : "New Member");
        user.setEmail(request.email());
        user.setPhone(request.phone());
        user.setPasswordHash(passwordEncoder.encode(request.password() == null || request.password().isBlank() ? "password" : request.password()));
        user.getRoles().add(role);
        userRepository.save(user);

        MemberProfile member = new MemberProfile();
        member.setUser(user);
        member.setGender(request.gender());
        member.setAddress(request.address());
        member.setEmergencyContact(request.emergencyContact());
        member.setHealthGoal(request.healthGoal());
        member.setPlanName(request.plan() != null ? request.plan() : "Monthly Gym");
        member.setTrainerName(request.trainer() != null ? request.trainer() : "Not Assigned");

        LocalDate renewal = LocalDate.now().plusMonths(1);
        if (request.renewal() != null && !request.renewal().isBlank()) {
            try {
                String renewalStr = request.renewal().length() >= 10 ? request.renewal().substring(0, 10) : request.renewal();
                renewal = LocalDate.parse(renewalStr);
            } catch (Exception ignored) {}
        }
        member.setRenewalDate(renewal);
        member.setStatus(calculateStatus(renewal, request.status()));

        MemberProfile saved = memberRepository.save(member);

        // Record Subscription
        saveMemberSubscription(saved, saved.getPlanName(), LocalDate.now(), renewal, saved.getStatus());

        return toResponse(saved);
    }

    @Transactional
    public MemberResponse update(Long id, MemberRequest request) {
        MemberProfile member = memberRepository.findById(id).orElse(null);
        if (member == null) {
            throw new ResourceNotFoundException("Member not found with id: " + id);
        }
        User user = member.getUser();

        if (user != null) {
            if (request.fullName() != null && !request.fullName().isBlank()) user.setFullName(request.fullName());
            if (request.email() != null && !request.email().isBlank()) {
                User existing = userRepository.findByEmail(request.email()).orElse(null);
                if (existing == null || existing.getId().equals(user.getId())) {
                    user.setEmail(request.email());
                }
            }
            if (request.phone() != null && !request.phone().isBlank()) user.setPhone(request.phone());
            try {
                userRepository.saveAndFlush(user);
            } catch (Exception ignored) {}
        }

        if (request.plan() != null && !request.plan().isBlank()) member.setPlanName(request.plan());
        if (request.trainer() != null && !request.trainer().isBlank()) member.setTrainerName(request.trainer());

        if (request.renewal() != null && !request.renewal().isBlank()) {
            try {
                String renewalStr = request.renewal().length() >= 10 ? request.renewal().substring(0, 10) : request.renewal();
                member.setRenewalDate(LocalDate.parse(renewalStr));
            } catch (Exception ignored) {}
        }

        if (request.gender() != null) member.setGender(request.gender());
        if (request.address() != null) member.setAddress(request.address());
        if (request.emergencyContact() != null) member.setEmergencyContact(request.emergencyContact());
        if (request.healthGoal() != null) member.setHealthGoal(request.healthGoal());
        if (request.dateOfBirth() != null && !request.dateOfBirth().isBlank()) {
            try {
                member.setDateOfBirth(LocalDate.parse(request.dateOfBirth()));
            } catch (Exception ignored) {}
        }

        member.setStatus(calculateStatus(member.getRenewalDate(), request.status()));
        MemberProfile updated = memberRepository.saveAndFlush(member);

        try {
            saveMemberSubscription(updated, updated.getPlanName(), LocalDate.now(), updated.getRenewalDate(), updated.getStatus());
        } catch (Exception ignored) {}

        return toResponse(updated);
    }

    @Transactional
    public MemberResponse updateWorkoutPlan(Long id, WorkoutPlanUpdateRequest request) {
        MemberProfile member = get(id);
        try {
            Map<String, Object> currentPlan = parseJsonMap(member.getWorkoutPlanJson());
            currentPlan.put(request.dayKey(), request.dayPlan());
            member.setWorkoutPlanJson(objectMapper.writeValueAsString(currentPlan));
        } catch (Exception e) {
            throw new RuntimeException("Failed to update workout plan", e);
        }
        return toResponse(member);
    }

    @Transactional
    public MemberResponse updateDietPlan(Long id, DietPlanUpdateRequest request) {
        MemberProfile member = get(id);
        try {
            member.setDietPlanJson(objectMapper.writeValueAsString(request.dietPlan()));
        } catch (Exception e) {
            throw new RuntimeException("Failed to update diet plan", e);
        }
        return toResponse(member);
    }

    @Transactional
    public MemberResponse purchasePlan(Long id, PurchasePlanRequest request) {
        MemberProfile member = get(id);
        LocalDate today = LocalDate.now();

        // Automatic status check & Single Active Subscription Enforcement
        String currentStatus = calculateStatus(member.getRenewalDate(), member.getStatus());
        if (member.getRenewalDate() != null && !member.getRenewalDate().isBefore(today) && !"Expired".equalsIgnoreCase(currentStatus)) {
            throw new SubscriptionConflictException("You already have an active membership. Purchase a new plan after expiry.");
        }

        member.setPlanName(request.planName());
        LocalDate startDate = today;
        LocalDate endDate = "Annual".equalsIgnoreCase(request.duration()) || (request.planName() != null && request.planName().toLowerCase().contains("annual"))
            ? startDate.plusYears(1)
            : startDate.plusMonths(1);

        member.setRenewalDate(endDate);
        member.setStatus("Active");
        MemberProfile updated = memberRepository.save(member);

        saveMemberSubscription(updated, request.planName(), startDate, endDate, "Active");

        return toResponse(updated);
    }

    @Transactional
    public void delete(Long id) {
        MemberProfile member = memberRepository.findById(id).orElse(null);
        if (member == null) return;

        // 1. Delete dependent subscriptions
        try {
            List<MemberSubscription> subs = subscriptionRepository.findByMemberId(id);
            if (!subs.isEmpty()) {
                subscriptionRepository.deleteAll(subs);
                subscriptionRepository.flush();
            }
        } catch (Exception ignored) {}

        // 2. Delete dependent trainer assignments
        try {
            List<TrainerAssignment> assignments = assignmentRepository.findByMember_Id(id);
            if (!assignments.isEmpty()) {
                assignmentRepository.deleteAll(assignments);
                assignmentRepository.flush();
            }
        } catch (Exception ignored) {}

        // 3. Delete dependent trainer requests
        try {
            List<TrainerRequest> reqs = requestRepository.findByMember_Id(id);
            if (!reqs.isEmpty()) {
                requestRepository.deleteAll(reqs);
                requestRepository.flush();
            }
        } catch (Exception ignored) {}

        User user = member.getUser();

        // 4. Delete member profile
        try {
            memberRepository.delete(member);
            memberRepository.flush();
        } catch (Exception e) {
            memberRepository.deleteById(id);
            memberRepository.flush();
        }

        // 5. Delete associated user and clear roles
        if (user != null) {
            try {
                user.getRoles().clear();
                userRepository.saveAndFlush(user);
                userRepository.delete(user);
                userRepository.flush();
            } catch (Exception ignored) {}
        }
    }

    public MemberProfile get(Long id) {
        return memberRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Member not found"));
    }

    private void saveMemberSubscription(MemberProfile member, String planName, LocalDate startDate, LocalDate endDate, String statusStr) {
        MembershipPlan planEntity = planRepository.findAll().stream()
            .filter(p -> p.getName().equalsIgnoreCase(planName))
            .findFirst()
            .orElse(null);

        SubscriptionStatus statusEnum = "Renewal Due".equalsIgnoreCase(statusStr) ? SubscriptionStatus.RENEWAL_DUE
            : "Expired".equalsIgnoreCase(statusStr) ? SubscriptionStatus.EXPIRED
            : SubscriptionStatus.ACTIVE;

        MemberSubscription subscription = subscriptionRepository
            .findFirstByMemberIdOrderByEndDateDesc(member.getId())
            .orElseGet(() -> {
                MemberSubscription ms = new MemberSubscription();
                ms.setMember(member);
                return ms;
            });

        subscription.setPlan(planEntity);
        subscription.setPlanName(planName);
        subscription.setStartDate(startDate);
        subscription.setEndDate(endDate);
        subscription.setStatus(statusEnum);

        subscriptionRepository.save(subscription);
    }

    private String calculateStatus(LocalDate renewalDate, String explicitStatus) {
        if (explicitStatus != null && !explicitStatus.isBlank() && !"Active".equalsIgnoreCase(explicitStatus)) {
            return explicitStatus;
        }
        if (renewalDate == null) return "Pending";
        LocalDate today = LocalDate.now();
        if (renewalDate.isBefore(today)) {
            return "Expired";
        }
        long daysRemaining = ChronoUnit.DAYS.between(today, renewalDate);
        if (daysRemaining <= 7) {
            return "Renewal Due";
        }
        return "Active";
    }

    private MemberResponse toResponse(MemberProfile member) {
        User user = member.getUser();
        Object workoutObj = parseJson(member.getWorkoutPlanJson());
        Object dietObj = parseJson(member.getDietPlanJson());
        String renewalStr = member.getRenewalDate() != null ? member.getRenewalDate().toString() : "";
        String currentStatus = calculateStatus(member.getRenewalDate(), member.getStatus());

        return new MemberResponse(
            member.getId(),
            user != null ? user.getId() : null,
            user != null ? user.getFullName() : "Member",
            user != null ? user.getEmail() : "",
            user != null ? user.getPhone() : "",
            member.getPlanName() != null ? member.getPlanName() : "None",
            member.getTrainerName() != null ? member.getTrainerName() : "Not Assigned",
            renewalStr,
            currentStatus,
            member.getHealthGoal() != null ? member.getHealthGoal() : "General Fitness",
            member.getGender() != null ? member.getGender() : "",
            member.getAddress() != null ? member.getAddress() : "",
            member.getEmergencyContact() != null ? member.getEmergencyContact() : "",
            member.getDateOfBirth() != null ? member.getDateOfBirth().toString() : "",
            workoutObj,
            dietObj
        );
    }

    private Object parseJson(String json) {
        if (json == null || json.isBlank()) return null;
        try {
            return objectMapper.readValue(json, Object.class);
        } catch (Exception e) {
            return null;
        }
    }

    @SuppressWarnings("unchecked")
    private Map<String, Object> parseJsonMap(String json) {
        if (json == null || json.isBlank()) return new java.util.HashMap<>();
        try {
            return objectMapper.readValue(json, Map.class);
        } catch (Exception e) {
            return new java.util.HashMap<>();
        }
    }
}
