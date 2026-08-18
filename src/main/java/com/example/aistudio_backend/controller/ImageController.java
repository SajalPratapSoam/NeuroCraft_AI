package com.example.aistudio_backend.controller;

import com.example.aistudio_backend.dto.ImageRequest;
import com.example.aistudio_backend.service.ImageGenerationService;
import com.example.aistudio_backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "http://localhost:5173")
public class ImageController {

    @Autowired
    private ImageGenerationService imageGenerationService;

    @Autowired
    private UserService userService;

    @PostMapping("/generate-image")
    public ResponseEntity<?> generateImage(@RequestBody ImageRequest request) {

        // 1. Get userId from JSON body (default to 1L if null)
        Long targetUserId = (request.getUserId() != null) ? request.getUserId() : 1L;

        try {
            // 2. Deduct credit for this specific user
            userService.deductCredit(targetUserId);

            // 3. Generate image using prompt (and optionally size)
            String resultUrl = imageGenerationService.generateAndSaveImage(request.getPrompt());

            // 4. Refund credit if API generation fails
            if (resultUrl.startsWith("Error")) {
                userService.refundCredit(targetUserId);
                return ResponseEntity.badRequest().body(Map.of("error", resultUrl));
            }

            return ResponseEntity.ok(Map.of(
                    "imageUrl", resultUrl,
                    "size", request.getSize() != null ? request.getSize() : "1024x1024"
            ));

        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}