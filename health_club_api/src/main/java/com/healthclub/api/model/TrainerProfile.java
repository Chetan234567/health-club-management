/*
 * File Path: health-club-api/src/main/java/com/healthclub/api/model/TrainerProfile.java
 * Entity: TrainerProfile (table: trainer_profiles)
 * Description: JPA Entity representing a personal fitness trainer's credentials, specialization, experience, certifications, and rating.
 * Frontend Integration: Maps to Trainer object returned via /api/trainers and displayed in TrainerDashboardView and TrainersView.
 */
package com.healthclub.api.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "trainer_profiles")
public class TrainerProfile extends BaseEntity {
    @OneToOne
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(nullable = false, length = 120)
    private String specialty;

    private String bio;
    private String experience = "5+ Years Experience";
    private Integer experienceYears = 5;
    private String certifications = "Certified Personal Trainer";
    private Integer sessions = 0;
    private Double rating = 4.5;
    private Integer activeClients = 0;
}
