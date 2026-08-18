package com.example.aistudio_backend.controller;

import com.example.aistudio_backend.entity.User;
import com.example.aistudio_backend.repository.UserRepository;
import com.example.aistudio_backend.security.JwtUtil;
import com.example.aistudio_backend.service.OtpService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder; // Make sure you have a PasswordEncoder bean!
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:5173")
public class AuthController {

    @Autowired
    private OtpService otpService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private PasswordEncoder passwordEncoder; // Used to hash passwords securely

    // ==========================================
    // 1. REGISTRATION: Send OTP
    // ==========================================
    @PostMapping("/register/send-otp")
    public ResponseEntity<?> sendRegistrationOtp(@RequestBody Map<String, String> request) {
        String email = request.get("email");

        // Make sure the email isn't already taken
        if (userRepository.findByEmail(email) != null) {
            return ResponseEntity.badRequest().body(Map.of("error", "Email is already registered. Please login."));
        }

        otpService.generateAndSendOtp(email);
        return ResponseEntity.ok(Map.of("message", "OTP sent successfully to " + email));
    }

    // ==========================================
    // 2. REGISTRATION: Verify OTP & Save User
    // ==========================================
    @PostMapping("/register/verify")
    public ResponseEntity<?> verifyAndRegister(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String otp = request.get("otp");
        String password = request.get("password"); // They must submit their chosen password here!

        if (!otpService.validateOtp(email, otp)) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid or expired OTP"));
        }

        // Double check they didn't get registered while waiting
        if (userRepository.findByEmail(email) != null) {
            return ResponseEntity.badRequest().body(Map.of("error", "User already exists."));
        }

        // Create the user
        User newUser = new User();
        newUser.setEmail(email);
        newUser.setPassword(passwordEncoder.encode(password)); // ALWAYS hash passwords!
        newUser.setCredits(10);
        newUser.setCurrentPlan("FREE");

        userRepository.save(newUser);

        // 👇 FIXED: Passing both email and userId to JwtUtil
        String token = jwtUtil.generateToken(email, newUser.getId());

        return ResponseEntity.ok(Map.of(
                "message", "Registration successful!",
                "token", token,
                "userId", newUser.getId()
        ));
    }

    // ==========================================
    // 3. LOGIN: Password Only (No OTP)
    // ==========================================
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        String password = request.get("password");

        User user = userRepository.findByEmail(email);

        // Check if user exists and password matches
        if (user == null || !passwordEncoder.matches(password, user.getPassword())) {
            return ResponseEntity.status(401).body(Map.of("error", "Invalid email or password"));
        }

        // 👇 FIXED: Passing both email and userId to JwtUtil
        String token = jwtUtil.generateToken(email, user.getId());

        return ResponseEntity.ok(Map.of(
                "message", "Login successful!",
                "token", token,
                "userId", user.getId()
        ));
    }
}