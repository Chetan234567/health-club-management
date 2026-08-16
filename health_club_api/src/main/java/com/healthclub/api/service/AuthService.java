	/*
	 * File Path: health-club-api/src/main/java/com/healthclub/api/service/AuthService.java
	 * Package: com.healthclub.api.service
	 * Description: Service managing user authentication, registration, JWT token generation, and password resets.
	 * Automatic Profile Provisioning: Automatically creates a MemberProfile or TrainerProfile upon user signup.
	 */
	package com.healthclub.api.service;
	
	import com.healthclub.api.dto.AuthDtos.AuthResponse;
	import com.healthclub.api.dto.AuthDtos.LoginRequest;
	import com.healthclub.api.dto.AuthDtos.RegisterRequest;
	import com.healthclub.api.dto.AuthDtos.ResetPasswordRequest;
	import com.healthclub.api.exception.ResourceNotFoundException;
	import com.healthclub.api.model.MemberProfile;
	import com.healthclub.api.model.Role;
	import com.healthclub.api.model.RoleName;
	import com.healthclub.api.model.TrainerProfile;
	import com.healthclub.api.model.User;
	import com.healthclub.api.repository.MemberProfileRepository;
	import com.healthclub.api.repository.RoleRepository;
	import com.healthclub.api.repository.TrainerProfileRepository;
	import com.healthclub.api.repository.UserRepository;
	import com.healthclub.api.security.JwtService;
	import java.time.LocalDate;
	import java.util.List;
	import org.springframework.security.authentication.AuthenticationManager;
	import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
	import org.springframework.security.crypto.password.PasswordEncoder;
	import org.springframework.stereotype.Service;
	import org.springframework.transaction.annotation.Transactional;
	
	@Service
	public class AuthService {
	    private final AuthenticationManager authenticationManager;
	    private final JwtService jwtService;
	    private final PasswordEncoder passwordEncoder;
	    private final RoleRepository roleRepository;
	    private final UserRepository userRepository;
	    private final MemberProfileRepository memberProfileRepository;
	    private final TrainerProfileRepository trainerProfileRepository;
	
	    public AuthService(
	        AuthenticationManager authenticationManager,
	        JwtService jwtService,
	        PasswordEncoder passwordEncoder,
	        RoleRepository roleRepository,
	        UserRepository userRepository,
	        MemberProfileRepository memberProfileRepository,
	        TrainerProfileRepository trainerProfileRepository
	    ) {
	        this.authenticationManager = authenticationManager;
	        this.jwtService = jwtService;
	        this.passwordEncoder = passwordEncoder;
	        this.roleRepository = roleRepository;
	        this.userRepository = userRepository;
	        this.memberProfileRepository = memberProfileRepository;
	        this.trainerProfileRepository = trainerProfileRepository;
	    }
	
	    public AuthResponse login(LoginRequest request) {
	        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(request.email(), request.password()));
	        User user = userRepository.findByEmail(request.email()).orElseThrow(() -> new ResourceNotFoundException("User not found"));
	        String token = jwtService.generateToken(org.springframework.security.core.userdetails.User.builder()
	            .username(user.getEmail())
	            .password(user.getPasswordHash())
	            .roles(user.getRoles().stream().map(role -> role.getName().name()).toArray(String[]::new))
	            .build());
	        return response(user, token);
	    }
	
	    @Transactional
	    public void register(RegisterRequest request) {
	        if (userRepository.existsByEmail(request.email())) {
	            throw new IllegalArgumentException("Email already exists");
	        }
	        RoleName roleName = RoleName.valueOf((request.role() == null ? "MEMBER" : request.role()).toUpperCase());
	        Role role = roleRepository.findByName(roleName).orElseThrow(() -> new ResourceNotFoundException("Role not found"));
	        User user = new User();
	        user.setFullName(request.fullName());
	        user.setEmail(request.email());
	        user.setPasswordHash(passwordEncoder.encode(request.password()));
	        user.setPhone(request.phone());
	        user.getRoles().add(role);
	        User savedUser = userRepository.save(user);
	
	        // Automatically provision corresponding profile
	        if (roleName == RoleName.MEMBER) {
	            MemberProfile member = new MemberProfile();
	            member.setUser(savedUser);
	            member.setPlanName("Monthly Gym");
	            member.setTrainerName("Not Assigned");
	            member.setRenewalDate(LocalDate.now().plusMonths(1));
	            member.setStatus("Active");
	            member.setHealthGoal(request.specialty() != null ? request.specialty() : "General Fitness");
	            memberProfileRepository.save(member);
	        } else if (roleName == RoleName.TRAINER) {
	            TrainerProfile trainer = new TrainerProfile();
	            trainer.setUser(savedUser);
	            trainer.setSpecialty(request.specialty() != null ? request.specialty() : "General Fitness Specialist");
	            trainer.setExperience(request.experience() != null ? request.experience() : "3+ Years Experience");
	            trainer.setCertifications(request.certifications() != null ? request.certifications() : "Certified Personal Trainer");
	            trainer.setSessions(0);
	            trainer.setRating(4.5);
	            trainerProfileRepository.save(trainer);
	        }
	
	        return;
	    }
	
	    @Transactional
	    public boolean resetPassword(ResetPasswordRequest request) {
	        User user = userRepository.findByEmail(request.email())
	            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
	        user.setPasswordHash(passwordEncoder.encode(request.password()));
	        userRepository.save(user);
	        return true;
	    }
	
	    private AuthResponse response(User user, String token) {
	        List<String> roles = user.getRoles().stream().map(role -> role.getName().name()).toList();
	        return new AuthResponse(token, user.getEmail(), user.getFullName(), roles);
	    }
	}
