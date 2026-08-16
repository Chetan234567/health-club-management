/*
 * File Path: health-club-api/src/main/java/com/healthclub/api/model/MembershipPlan.java
 * Entity: MembershipPlan (table: membership_plans)
 * Description: JPA Entity representing subscription plan offerings (e.g., Monthly Gym, Strength Pro) with duration, price in INR, and feature bullet points.
 * Frontend Integration: Maps to Plan objects fetched from /api/plans and rendered in PlansView.
 */
package com.healthclub.api.model;

import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "membership_plans")
public class MembershipPlan extends BaseEntity {
    @Column(nullable = false, length = 100)
    private String name;

    @Column(precision = 10, scale = 2)
    private BigDecimal priceInr = BigDecimal.valueOf(999.00);

    private String price = "₹999";
    private String duration = "Monthly";
    private Integer durationDays = 30;

    private String description;
    private boolean active = true;
    private Integer membersCount = 0;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "plan_features", joinColumns = @JoinColumn(name = "plan_id"))
    @Column(name = "feature_text", nullable = false)
    private List<String> features = new ArrayList<>();
}
