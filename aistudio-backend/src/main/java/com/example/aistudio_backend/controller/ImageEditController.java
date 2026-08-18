package com.example.aistudio_backend.controller;

import com.example.aistudio_backend.entity.User;
import com.example.aistudio_backend.service.BackgroundRemovalService;
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
public class ImageEditController {

    @Autowired
    private BackgroundRemovalService backgroundRemovalService;

    @Autowired
    private UserService userService;

    @PostMapping("/remove-background")
    public ResponseEntity<?> removeBackground(@RequestParam("file") MultipartFile file,
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

        if (file.isEmpty() || file.getContentType() == null || !file.getContentType().startsWith("image/")) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "Please upload a valid image file (JPG/PNG)."
            ));
        }

        try {

            userService.deductCredit(currentUserId);


            String resultUrl = backgroundRemovalService.removeBackgroundAndSave(file);


            if (resultUrl.startsWith("Error")) {
                userService.refundCredit(currentUserId);
                return ResponseEntity.badRequest().body(Map.of("error", resultUrl));
            }

            User updatedUser = userService.getUserDetails(currentUserId);
            return ResponseEntity.ok(Map.of(
                    "imageUrl", resultUrl,
                    "credits", updatedUser != null ? updatedUser.getCredits() : 0,
                    "currentPlan", updatedUser != null ? updatedUser.getCurrentPlan() : "FREE"
            ));

        } catch (Exception e) {

            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}