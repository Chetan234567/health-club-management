/*
 * File Path: health-club-api/src/main/java/com/healthclub/api/service/PlanService.java
 * Service: PlanService
 * Description: Business logic service managing membership plans, prices, durations, features list, and CRUD persistence.
 */
package com.healthclub.api.service;

import com.healthclub.api.dto.PlanDtos.PlanRequest;
import com.healthclub.api.dto.PlanDtos.PlanResponse;
import com.healthclub.api.exception.ResourceNotFoundException;
import com.healthclub.api.model.MemberSubscription;
import com.healthclub.api.model.MembershipPlan;
import com.healthclub.api.repository.MemberSubscriptionRepository;
import com.healthclub.api.repository.MembershipPlanRepository;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PlanService {
    private final MembershipPlanRepository repository;
    private final MemberSubscriptionRepository subscriptionRepository;

    public PlanService(MembershipPlanRepository repository, MemberSubscriptionRepository subscriptionRepository) {
        this.repository = repository;
        this.subscriptionRepository = subscriptionRepository;
    }

    public List<PlanResponse> findAll() {
        return repository.findAll().stream().map(this::toResponse).toList();
    }

    public PlanResponse findById(Long id) {
        return toResponse(get(id));
    }

    @Transactional
    public PlanResponse create(PlanRequest request) {
        MembershipPlan plan = new MembershipPlan();
        apply(plan, request);
        return toResponse(repository.save(plan));
    }

    @Transactional
    public PlanResponse update(Long id, PlanRequest request) {
        MembershipPlan plan = get(id);
        apply(plan, request);
        return toResponse(repository.save(plan));
    }

    @Transactional
    public void delete(Long id) {
        MembershipPlan plan = get(id);

        // 1. Unlink dependent member subscriptions and flush changes to SQL immediately
        List<MemberSubscription> subscriptions = subscriptionRepository.findAll().stream()
            .filter(s -> s.getPlan() != null && s.getPlan().getId().equals(id))
            .toList();

        for (MemberSubscription sub : subscriptions) {
            sub.setPlan(null);
        }
        subscriptionRepository.saveAllAndFlush(subscriptions);

        // 2. Clear element collection and flush
        plan.getFeatures().clear();
        repository.saveAndFlush(plan);

        // 3. Delete plan entity
        repository.delete(plan);
        repository.flush();
    }

    public MembershipPlan get(Long id) {
        return repository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Plan not found"));
    }

    private void apply(MembershipPlan plan, PlanRequest request) {
        if (request.name() != null && !request.name().isBlank()) {
            plan.setName(request.name());
        }

        if (request.price() != null && !request.price().isBlank()) {
            plan.setPrice(request.price());
        }

        if (request.priceInr() != null) {
            plan.setPriceInr(BigDecimal.valueOf(request.priceInr()));
        } else if (plan.getPrice() != null) {
            try {
                String digits = plan.getPrice().replaceAll("[^0-9.]", "");
                if (!digits.isBlank()) {
                    plan.setPriceInr(new BigDecimal(digits));
                }
            } catch (Exception ignored) {}
        }
        if (plan.getPriceInr() == null) {
            plan.setPriceInr(BigDecimal.valueOf(999.00));
        }

        if (request.duration() != null && !request.duration().isBlank()) {
            plan.setDuration(request.duration());
        }

        if (request.durationDays() != null) {
            plan.setDurationDays(request.durationDays());
        } else if (plan.getDuration() != null && plan.getDuration().toLowerCase().contains("annual")) {
            plan.setDurationDays(365);
        } else {
            plan.setDurationDays(30);
        }

        if (request.description() != null) plan.setDescription(request.description());
        if (request.members() != null) plan.setMembersCount(request.members());
        if (request.features() != null) plan.setFeatures(new ArrayList<>(request.features()));
        if (request.active() != null) plan.setActive(request.active());
    }

    public PlanResponse toResponse(MembershipPlan plan) {
        return new PlanResponse(
            plan.getId(),
            plan.getName(),
            plan.getPrice() != null ? plan.getPrice() : "₹" + plan.getPriceInr(),
            plan.getDuration() != null ? plan.getDuration() : "Monthly",
            plan.getMembersCount() != null ? plan.getMembersCount() : 0,
            plan.getFeatures()
        );
    }
}
