package com.example.aistudio_backend.controller;

import com.example.aistudio_backend.dto.ImageRequest;
import com.example.aistudio_backend.entity.User;
import com.example.aistudio_backend.service.ImageGenerationService;
import com.example.aistudio_backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174"})
public class ImageController {

    @Autowired
    private ImageGenerationService imageGenerationService;

    @Autowired
    private UserService userService;

    @PostMapping("/generate-image")
    public ResponseEntity<?> generateImage(@RequestBody ImageRequest request) {

        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String email = null;
        if (authentication != null && authentication.getPrincipal() instanceof String principal) {
            email = principal;
        }
        if ((email == null || email.isBlank()) && request.getEmail() != null && !request.getEmail().isBlank()) {
            email = request.getEmail();
        }

        Long targetUserId = userService.resolveUserId(email, request.getUserId());

        try {

            userService.deductCredit(targetUserId);

            String resultUrl = imageGenerationService.generateAndSaveImage(request.getPrompt());


            if (resultUrl.startsWith("Error")) {
                userService.refundCredit(targetUserId);
                return ResponseEntity.badRequest().body(Map.of("error", resultUrl));
            }

            User updatedUser = userService.getUserDetails(targetUserId);
            return ResponseEntity.ok(Map.of(
                    "imageUrl", resultUrl,
                    "size", request.getSize() != null ? request.getSize() : "1024x1024",
                    "credits", updatedUser != null ? updatedUser.getCredits() : 0,
                    "currentPlan", updatedUser != null ? updatedUser.getCurrentPlan() : "FREE"
            ));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}