package com.example.aistudio_backend.controller;

import com.example.aistudio_backend.entity.User;
import com.example.aistudio_backend.service.ResumeReviewService;
import com.example.aistudio_backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
public class ResumeController {

    @Autowired
    private ResumeReviewService resumeReviewService;

    @Autowired
    private UserService userService;


    @PostMapping("/review-resume")
    public ResponseEntity<Map<String, Object>> reviewResume(@RequestParam("file") MultipartFile file,
                                                            @RequestParam(value = "email", required = false) String email) {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String resolvedEmail = null;
        if (authentication != null && authentication.getPrincipal() instanceof String principal) {
            resolvedEmail = principal;
        }
        if ((resolvedEmail == null || resolvedEmail.isBlank()) && email != null && !email.isBlank()) {
            resolvedEmail = email;
        }

        Long currentUserId = userService.resolveUserId(resolvedEmail, null);


        if (file.isEmpty() || !file.getContentType().equals("application/pdf")) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "Please upload a valid PDF file."
            ));
        }

        try {
            userService.deductCredit(currentUserId);


            String aiReviewResult = resumeReviewService.reviewResume(file);

            if (aiReviewResult.startsWith("Error")) {
                userService.refundCredit(currentUserId);
                return ResponseEntity.badRequest().body(Map.of("error", aiReviewResult));
            }

            User updatedUser = userService.getUserDetails(currentUserId);
            return ResponseEntity.ok(Map.of(
                    "review", aiReviewResult,
                    "credits", updatedUser != null ? updatedUser.getCredits() : 0,
                    "currentPlan", updatedUser != null ? updatedUser.getCurrentPlan() : "FREE"
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}