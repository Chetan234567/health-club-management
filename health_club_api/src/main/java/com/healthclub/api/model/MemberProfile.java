/*
 * File Path: health-club-api/src/main/java/com/healthclub/api/model/MemberProfile.java
 * Entity: MemberProfile (table: member_profiles)
 * Description: JPA Entity representing a health club member's profile, including active plan, trainer assignment, renewal date, and JSON-encoded workout/diet routines.
 * Frontend Integration: Maps to MemberProfile objects consumed and edited in MemberDashboardView and MembersView.
 */
package com.healthclub.api.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import java.time.LocalDate;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@Entity
@Table(name = "member_profiles")
public class MemberProfile extends BaseEntity {
    @OneToOne
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    private LocalDate dateOfBirth;
    @Column(length = 20)
    private String gender;
    private String address;
    @Column(length = 40)
    private String emergencyContact;
    private LocalDate joinDate = LocalDate.now();
    private String healthGoal;

    private String planName;
    private String trainerName;
    private LocalDate renewalDate;
    private String status = "Active";

    @Column(columnDefinition = "LONGTEXT")
    private String workoutPlanJson;

    @Column(columnDefinition = "LONGTEXT")
    private String dietPlanJson;
}
