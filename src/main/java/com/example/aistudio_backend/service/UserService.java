package com.example.aistudio_backend.service;

import com.example.aistudio_backend.entity.User;
import com.example.aistudio_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    /**
     * Deducts 1 credit for premium tools (Image Gen & BG Removal).
     * Blocks the user when credits reach 0.
     */
    @Transactional
    public void deductCredit(Long userId) throws Exception {
        User user = userRepository.findById(userId).orElseGet(() -> {
            User newUser = new User();
            newUser.setEmail("student@college.edu");
            newUser.setCredits(10); // 10 Free Credits default
            newUser.setCurrentPlan("FREE");
            return userRepository.save(newUser);
        });

        if (user.getCredits() <= 0) {
            throw new Exception("You have used up your 10 free credits for image generation and background removal! Please upgrade to a Weekly, Monthly, or Yearly plan to continue.");
        }

        user.setCredits(user.getCredits() - 1);
        userRepository.save(user);
    }

    /**
     * Refunds 1 credit if an external API (Clipdrop / Remove.bg) fails.
     */
    @Transactional
    public void refundCredit(Long userId) {
        userRepository.findById(userId).ifPresent(user -> {
            user.setCredits(user.getCredits() + 1);
            userRepository.save(user);
        });
    }

    public User getUserDetails(Long userId) {
        return userRepository.findById(userId).orElse(null);
    }

    /**
     * Saves a new free user to MySQL with 10 free credits.
     */
    public User registerUser(String email, String password) throws Exception {
        // Check if the user already exists in the database
        if (userRepository.findByEmail(email) != null) {
            throw new Exception("User with this email already exists!");
        }

        User newUser = new User();
        newUser.setEmail(email);
        newUser.setPassword(password); // In production, hash password using BCrypt
        newUser.setCredits(10);        // Default 10 free credits
        newUser.setCurrentPlan("FREE");// Saved as FREE plan user
        newUser.setPlanExpiryDate(null);

        return userRepository.save(newUser);
    }
}