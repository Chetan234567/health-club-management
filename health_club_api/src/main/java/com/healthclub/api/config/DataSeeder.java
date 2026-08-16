package com.healthclub.api.config;

import com.healthclub.api.model.MemberProfile;
import com.healthclub.api.model.MembershipPlan;
import com.healthclub.api.model.Role;
import com.healthclub.api.model.RoleName;
import com.healthclub.api.model.TrainerProfile;
import com.healthclub.api.model.User;
import com.healthclub.api.repository.MemberProfileRepository;
import com.healthclub.api.repository.MembershipPlanRepository;
import com.healthclub.api.repository.RoleRepository;
import com.healthclub.api.repository.TrainerProfileRepository;
import com.healthclub.api.repository.UserRepository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataSeeder {
    @Bean
    CommandLineRunner seedData(
        MemberProfileRepository memberRepository,
        MembershipPlanRepository planRepository,
        PasswordEncoder passwordEncoder,
        RoleRepository roleRepository,
        TrainerProfileRepository trainerRepository,
        UserRepository userRepository
    ) {
        return args -> {
            Role adminRole = roleRepository.findByName(RoleName.ADMIN).orElseGet(() -> roleRepository.save(new Role(RoleName.ADMIN, "System administrator")));
            Role memberRole = roleRepository.findByName(RoleName.MEMBER).orElseGet(() -> roleRepository.save(new Role(RoleName.MEMBER, "Club member")));
            Role trainerRole = roleRepository.findByName(RoleName.TRAINER).orElseGet(() -> roleRepository.save(new Role(RoleName.TRAINER, "Fitness trainer")));

            if (!userRepository.existsByEmail("admin@healthclub.com")) {
                User admin = user("Admin User", "admin@healthclub.com", "+91 90000 00001", passwordEncoder);
                admin.getRoles().add(adminRole);
                userRepository.save(admin);
            }

            if (planRepository.count() == 0) {
                planRepository.save(plan("Monthly Gym", "₹1,499", "1499", "Monthly", 30, 412, List.of("Gym floor access", "Standard locker", "Basic workout template")));
                planRepository.save(plan("Strength Pro", "₹2,499", "2499", "Monthly", 30, 286, List.of("Assigned trainer", "Custom Day-by-Day workout plan", "Tailored diet & macros")));
                planRepository.save(plan("Yoga Plus", "₹1,999", "1999", "Monthly", 30, 198, List.of("Yoga & mobility plan", "Breathwork guide", "Personalized diet chart")));
                planRepository.save(plan("Elite Annual", "₹24,999", "24999", "Annual", 365, 388, List.of("All access & priority booking", "Dedicated personal trainer", "Weekly workout & diet plan updates")));
            }

            if (trainerRepository.count() == 0) {
                User nisha = userRepository.save(userWithRole("Nisha Rao", "trainer@healthclub.com", "+91 98765 20201", trainerRole, passwordEncoder));
                User kabir = userRepository.save(userWithRole("Kabir Singh", "kabir@healthclub.com", "+91 98765 20202", trainerRole, passwordEncoder));
                User meera = userRepository.save(userWithRole("Meera Bose", "meera@healthclub.com", "+91 98765 20203", trainerRole, passwordEncoder));
                User arjun = userRepository.save(userWithRole("Arjun Nair", "arjun@healthclub.com", "+91 98765 20204", trainerRole, passwordEncoder));

                trainerRepository.save(trainer(nisha, "Functional Training & Athletic Conditioning", "6+ Years Experience", 6, "ACE Certified Personal Trainer, Crossfit L-2 Specialist", 44, 4.9));
                trainerRepository.save(trainer(kabir, "HIIT, Body Fat Loss & Calisthenics", "8+ Years Experience", 8, "NSCA-CPT Certified, Kettlebell Master Coach", 39, 4.8));
                trainerRepository.save(trainer(meera, "Power Yoga, Posture Alignment & Mobility", "5+ Years Experience", 5, "RYT 500 Yoga Alliance Certified, Sports Nutritionist", 31, 4.9));
                trainerRepository.save(trainer(arjun, "Hypertrophy & Powerlifting Strength Coaching", "7+ Years Experience", 7, "ISSA Master Trainer, CSCS", 36, 4.7));
            }

            if (memberRepository.count() == 0) {
                User priya = userRepository.save(userWithRole("Priya Shah", "member@healthclub.com", "+91 99887 76655", memberRole, passwordEncoder));
                User rohan = userRepository.save(userWithRole("Rohan Iyer", "rohan@healthclub.com", "+91 99887 11122", memberRole, passwordEncoder));
                User anaya = userRepository.save(userWithRole("Anaya Rao", "anaya@healthclub.com", "+91 99887 33344", memberRole, passwordEncoder));

                memberRepository.save(member(priya, "Strength Pro", "Nisha Rao", LocalDate.parse("2026-08-15"), "Active", "Weight loss & Strength Pro plan"));
                memberRepository.save(member(rohan, "Monthly Gym", "Kabir Singh", LocalDate.parse("2026-08-02"), "Renewal Due", "General fitness"));
                memberRepository.save(member(anaya, "Yoga Plus", "Meera Bose", LocalDate.parse("2026-09-01"), "Active", "Yoga mobility & posture plan"));
            }
        };
    }

    private User user(String name, String email, String phone, PasswordEncoder encoder) {
        User user = new User();
        user.setFullName(name);
        user.setEmail(email);
        user.setPhone(phone);
        user.setPasswordHash(encoder.encode("password"));
        return user;
    }

    private User userWithRole(String name, String email, String phone, Role role, PasswordEncoder encoder) {
        User user = user(name, email, phone, encoder);
        user.getRoles().add(role);
        return user;
    }

    private MembershipPlan plan(String name, String priceStr, String priceInr, String duration, Integer durationDays, Integer membersCount, List<String> features) {
        MembershipPlan plan = new MembershipPlan();
        plan.setName(name);
        plan.setPrice(priceStr);
        plan.setPriceInr(new BigDecimal(priceInr));
        plan.setDuration(duration);
        plan.setDurationDays(durationDays);
        plan.setMembersCount(membersCount);
        plan.setDescription(name + " membership plan");
        plan.setFeatures(features);
        return plan;
    }

    private TrainerProfile trainer(User user, String specialty, String experience, Integer experienceYears, String certifications, Integer sessions, Double rating) {
        TrainerProfile trainer = new TrainerProfile();
        trainer.setUser(user);
        trainer.setSpecialty(specialty);
        trainer.setExperience(experience);
        trainer.setExperienceYears(experienceYears);
        trainer.setCertifications(certifications);
        trainer.setSessions(sessions);
        trainer.setRating(rating);
        trainer.setActiveClients(0);
        return trainer;
    }

    private MemberProfile member(User user, String planName, String trainerName, LocalDate renewalDate, String status, String goal) {
        MemberProfile member = new MemberProfile();
        member.setUser(user);
        member.setPlanName(planName);
        member.setTrainerName(trainerName);
        member.setRenewalDate(renewalDate);
        member.setStatus(status);
        member.setHealthGoal(goal);
        return member;
    }
}
