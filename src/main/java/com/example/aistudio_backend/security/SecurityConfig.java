package com.example.aistudio_backend.security;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod; // Required for HttpMethod.OPTIONS
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder; // 👇 Added this
import org.springframework.security.crypto.password.PasswordEncoder; // 👇 Added this
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Autowired
    private JwtAuthFilter jwtAuthFilter;

    // ==========================================
    // 👇 ADDED THE PASSWORD ENCODER BEAN
    // ==========================================
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable()) // Disable CSRF for REST APIs
                .cors(cors -> cors.configure(http)) // Allow CORS for frontend

                .authorizeHttpRequests(auth -> auth
                        // Allow browser preflight requests
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // Allow public authentication and payment routes
                        .requestMatchers("/api/auth/**").permitAll()
                        .requestMatchers("/api/payment/**").permitAll()

                        // Makes standard registration public (can be removed if you deleted it from UserController)
                        .requestMatchers("/api/user/register").permitAll()

                        // SECURE: Everything else requires a valid JWT Token!
                        .anyRequest().authenticated()
                )

                // Set session management to stateless (JWT does not use server sessions)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                // Inject our custom JWT filter before the standard authentication filter
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}