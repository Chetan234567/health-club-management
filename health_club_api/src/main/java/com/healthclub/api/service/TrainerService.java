/*
 * File Path: health-club-api/src/main/java/com/healthclub/api/service/TrainerService.java
 * Service: TrainerService
 * Description: Business logic service managing personal trainer profiles, specialization, credentials, ratings, and CRUD operations.
 */
package com.healthclub.api.service;

import com.healthclub.api.dto.TrainerDtos.TrainerRequestDto;
import com.healthclub.api.dto.TrainerDtos.TrainerResponse;
import com.healthclub.api.exception.ResourceNotFoundException;
import com.healthclub.api.model.Role;
import com.healthclub.api.model.RoleName;
import com.healthclub.api.model.TrainerAssignment;
import com.healthclub.api.model.TrainerProfile;
import com.healthclub.api.model.TrainerRequest;
import com.healthclub.api.model.User;
import com.healthclub.api.repository.RoleRepository;
import com.healthclub.api.repository.TrainerAssignmentRepository;
import com.healthclub.api.repository.TrainerProfileRepository;
import com.healthclub.api.repository.TrainerRequestRepository;
import com.healthclub.api.repository.UserRepository;
import java.util.List;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TrainerService {
    private final PasswordEncoder passwordEncoder;
    private final RoleRepository roleRepository;
    private final TrainerProfileRepository trainerRepository;
    private final UserRepository userRepository;
    private final TrainerAssignmentRepository assignmentRepository;
    private final TrainerRequestRepository requestRepository;

    public TrainerService(
        PasswordEncoder passwordEncoder,
        RoleRepository roleRepository,
        TrainerProfileRepository trainerRepository,
        UserRepository userRepository,
        TrainerAssignmentRepository assignmentRepository,
        TrainerRequestRepository requestRepository
    ) {
        this.passwordEncoder = passwordEncoder;
        this.roleRepository = roleRepository;
        this.trainerRepository = trainerRepository;
        this.userRepository = userRepository;
        this.assignmentRepository = assignmentRepository;
        this.requestRepository = requestRepository;
    }

    public List<TrainerResponse> findAll() {
        return trainerRepository.findAll().stream().map(this::toResponse).toList();
    }

    public TrainerResponse findById(Long id) {
        return toResponse(get(id));
    }

    @Transactional
    public TrainerResponse create(TrainerRequestDto request) {
        Role role = roleRepository.findByName(RoleName.TRAINER).orElseThrow(() -> new ResourceNotFoundException("Role not found"));
        User user = new User();
        user.setFullName(request.fullName() != null ? request.fullName() : "New Trainer");
        user.setEmail(request.email());
        user.setPhone(request.phone());
        user.setPasswordHash(passwordEncoder.encode(request.password() == null || request.password().isBlank() ? "password" : request.password()));
        user.getRoles().add(role);
        userRepository.save(user);

        TrainerProfile trainer = new TrainerProfile();
        trainer.setUser(user);
        trainer.setSpecialty(request.specialty() != null ? request.specialty() : "General Fitness Specialist");
        trainer.setBio(request.bio());
        trainer.setExperience(request.experience() != null ? request.experience() : "3+ Years Experience");
        trainer.setExperienceYears(request.experienceYears() != null ? request.experienceYears() : 3);
        trainer.setCertifications(request.certifications() != null ? request.certifications() : "Certified Personal Trainer");
        trainer.setSessions(request.sessions() != null ? request.sessions() : 0);
        trainer.setRating(request.rating() != null ? request.rating() : 4.5);
        return toResponse(trainerRepository.save(trainer));
    }

    @Transactional
    public TrainerResponse update(Long id, TrainerRequestDto request) {
        TrainerProfile trainer = get(id);
        User user = trainer.getUser();

        if (user != null) {
            if (request.fullName() != null && !request.fullName().isBlank()) user.setFullName(request.fullName());
            if (request.email() != null && !request.email().isBlank()) user.setEmail(request.email());
            if (request.phone() != null && !request.phone().isBlank()) user.setPhone(request.phone());
            userRepository.save(user);
        }

        if (request.specialty() != null && !request.specialty().isBlank()) trainer.setSpecialty(request.specialty());
        if (request.bio() != null) trainer.setBio(request.bio());
        if (request.experience() != null && !request.experience().isBlank()) trainer.setExperience(request.experience());
        if (request.experienceYears() != null) trainer.setExperienceYears(request.experienceYears());
        if (request.certifications() != null && !request.certifications().isBlank()) trainer.setCertifications(request.certifications());
        if (request.sessions() != null) trainer.setSessions(request.sessions());
        if (request.rating() != null) trainer.setRating(request.rating());

        TrainerProfile updated = trainerRepository.save(trainer);
        return toResponse(updated);
    }

    @Transactional
    public void delete(Long id) {
        TrainerProfile trainer = trainerRepository.findById(id).orElse(null);
        if (trainer == null) return;

        // 1. Delete dependent trainer assignments
        try {
            List<TrainerAssignment> assignments = assignmentRepository.findByTrainer_Id(id);
            if (!assignments.isEmpty()) {
                assignmentRepository.deleteAll(assignments);
                assignmentRepository.flush();
            }
        } catch (Exception ignored) {}

        // 2. Delete dependent trainer requests
        try {
            List<TrainerRequest> reqs = requestRepository.findAll().stream()
                .filter(r -> r.getTrainer() != null && r.getTrainer().getId().equals(id))
                .toList();
            if (!reqs.isEmpty()) {
                requestRepository.deleteAll(reqs);
                requestRepository.flush();
            }
        } catch (Exception ignored) {}

        User user = trainer.getUser();

        // 3. Delete trainer profile
        try {
            trainerRepository.delete(trainer);
            trainerRepository.flush();
        } catch (Exception e) {
            trainerRepository.deleteById(id);
            trainerRepository.flush();
        }

        // 4. Delete associated user and clear roles
        if (user != null) {
            try {
                user.getRoles().clear();
                userRepository.saveAndFlush(user);
                userRepository.delete(user);
                userRepository.flush();
            } catch (Exception ignored) {}
        }
    }

    public TrainerProfile get(Long id) {
        return trainerRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Trainer not found"));
    }

    public TrainerResponse toResponse(TrainerProfile trainer) {
        User user = trainer.getUser();
        return new TrainerResponse(
            trainer.getId(),
            user != null ? user.getId() : null,
            user != null ? user.getFullName() : "Trainer",
            user != null ? user.getEmail() : "",
            user != null ? user.getPhone() : "",
            trainer.getSpecialty(),
            trainer.getExperience(),
            trainer.getCertifications(),
            trainer.getSessions(),
            trainer.getRating(),
            trainer.getActiveClients()
        );
    }
}
