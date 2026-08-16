/*
 * Entity Flow: Hibernate maps this class to a normalized database table.
 * Relationships here define how tables connect through foreign keys.
 */
// Short flow: Entity fields become table columns and relationships become foreign keys.
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
@Table(name = "trainer_assignments")
public class TrainerAssignment extends BaseEntity {
    @ManyToOne
    @JoinColumn(name = "member_id", nullable = false)
    private MemberProfile member;

    @ManyToOne
    @JoinColumn(name = "trainer_id", nullable = false)
    private TrainerProfile trainer;

    private LocalDate startDate = LocalDate.now();
    private LocalDate endDate;

    @Enumerated(EnumType.STRING)
    private SubscriptionStatus status = SubscriptionStatus.ACTIVE;
}
