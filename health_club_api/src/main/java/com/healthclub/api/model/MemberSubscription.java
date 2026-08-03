package com.healthclub.api.model;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDate;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "member_subscriptions")
public class MemberSubscription extends BaseEntity {
    @ManyToOne
    @JoinColumn(name = "member_id", nullable = false)
    private MemberProfile member;

    @ManyToOne
    @JoinColumn(name = "plan_id")
    private MembershipPlan plan;

    private String planName;
    private LocalDate startDate = LocalDate.now();
    private LocalDate endDate;

    @Enumerated(EnumType.STRING)
    private SubscriptionStatus status = SubscriptionStatus.ACTIVE;
}
