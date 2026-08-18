package com.example.aistudio_backend.controller;

import com.example.aistudio_backend.service.BackgroundRemovalService;
import com.example.aistudio_backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "http://localhost:5173")
public class ImageEditController {

    @Autowired
    private BackgroundRemovalService backgroundRemovalService;

    @Autowired
    private UserService userService;

    @PostMapping("/remove-background")
    public ResponseEntity<?> removeBackground(@RequestParam("file") MultipartFile file) {
        Long currentUserId = 1L; // Hardcoded until JWT

        if (file.isEmpty() || file.getContentType() == null || !file.getContentType().startsWith("image/")) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "Please upload a valid image file (JPG/PNG)."
            ));
        }

        try {
            // 1. Deduct 1 credit for background removal
            userService.deductCredit(currentUserId);

            // 2. Process image with Remove.bg
            String resultUrl = backgroundRemovalService.removeBackgroundAndSave(file);

            // 3. Refund if API call fails
            if (resultUrl.startsWith("Error")) {
                userService.refundCredit(currentUserId);
                return ResponseEntity.badRequest().body(Map.of("error", resultUrl));
            }

            return ResponseEntity.ok(Map.of("imageUrl", resultUrl));

        } catch (Exception e) {
            // Returns: "You have used up your 10 free credits..."
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}