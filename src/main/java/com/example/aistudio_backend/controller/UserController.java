package com.example.aistudio_backend.controller;

import com.example.aistudio_backend.dto.RegisterRequest;
import com.example.aistudio_backend.entity.User;
import com.example.aistudio_backend.service.UserService;
import com.example.aistudio_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/user")
@CrossOrigin(origins = "http://localhost:5173")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@RequestBody RegisterRequest request) {
        try {
            if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
                return ResponseEntity.badRequest().body(Map.of("error", "Email is required"));
            }

            User registeredUser = userService.registerUser(request.getEmail(), request.getPassword());

            return ResponseEntity.ok(Map.of(
                    "message", "User registered successfully on Free Tier!",
                    "userId", registeredUser.getId(),
                    "email", registeredUser.getEmail(),
                    "credits", registeredUser.getCredits(),
                    "currentPlan", registeredUser.getCurrentPlan()
            ));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/profile")
    public ResponseEntity<?> getUserProfile() {

        // 1. Get the email securely extracted from the JWT token
        String email = SecurityContextHolder.getContext().getAuthentication().getName();

        // 2. Fetch the user directly (matching your repository's return type)
        User user = userRepository.findByEmail(email);

        if (user == null) {
            return ResponseEntity.status(404).body(Map.of("error", "User not found"));
        }

        // 3. Return the profile securely
        return ResponseEntity.ok(Map.of(
                "id", user.getId(),
                "email", user.getEmail(),
                "credits", user.getCredits(),
                "currentPlan", user.getCurrentPlan(),
                "planExpiryDate", user.getPlanExpiryDate() != null ? user.getPlanExpiryDate().toString() : "N/A"
        ));
    }
}