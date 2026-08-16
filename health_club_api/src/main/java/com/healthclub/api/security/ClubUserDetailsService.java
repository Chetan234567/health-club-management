/*
 * Security Flow: Login creates JWT -> requests send Bearer token -> filter validates token -> role rules allow access.
 * These classes keep authentication separate from business controllers.
 */
// Short flow: Validate JWT and attach authenticated user to Spring Security context.
package com.healthclub.api.security;

import com.healthclub.api.repository.UserRepository;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class ClubUserDetailsService implements UserDetailsService {
    private final UserRepository userRepository;

    public ClubUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String username) {
        com.healthclub.api.model.User user = userRepository.findByEmail(username)
            .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        String[] roles = user.getRoles().stream()
            .map(role -> role.getName().name())
            .toArray(String[]::new);

        return User.builder()
            .username(user.getEmail())
            .password(user.getPasswordHash())
            .roles(roles)
            .disabled(user.getStatus().name().equals("INACTIVE"))
            .build();
    }
}
