package com.example.aistudio_backend.controller;

import com.example.aistudio_backend.service.ResumeReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "http://localhost:5173") // Connects to your React frontend
public class ResumeController {

    @Autowired
    private ResumeReviewService resumeReviewService;

    /**
     * Endpoint for uploading a PDF resume.
     * We use @RequestParam("file") MultipartFile to handle the file upload stream.
     */
    @PostMapping("/review-resume")
    public ResponseEntity<Map<String, String>> reviewResume(@RequestParam("file") MultipartFile file) {

        // Validation: Ensure the user actually uploaded a file and it is a PDF
        if (file.isEmpty() || !file.getContentType().equals("application/pdf")) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "Please upload a valid PDF file."
            ));
        }

        // Call our Service to process the file
        String aiReviewResult = resumeReviewService.reviewResume(file);

        if (aiReviewResult.startsWith("Error")) {
            return ResponseEntity.badRequest().body(Map.of("error", aiReviewResult));
        }

        // Return the AI's review to the React frontend
        return ResponseEntity.ok(Map.of("review", aiReviewResult));
    }
}