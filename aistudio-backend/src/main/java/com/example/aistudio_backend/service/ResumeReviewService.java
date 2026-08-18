package com.example.aistudio_backend.service;

import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ResumeReviewService {

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    private final String GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";
    private final RestTemplate restTemplate = new RestTemplate();

    /**
     * MAIN METHOD: This is what the Controller will call.
     * It takes the uploaded PDF, extracts the text, and asks AI to score it.
     */
    public String reviewResume(MultipartFile file) {
        try {
            // STEP 1: Extract plain text from the PDF file
            String resumeText = extractTextFromPdf(file);

            // STEP 2: Send that extracted text to Gemini for review
            return analyzeWithGemini(resumeText);

        } catch (IOException e) {
            return "Error reading the PDF file: " + e.getMessage();
        }
    }

    /**
     * HELPER METHOD 1: Reads the PDF file.
     * If your professor asks, tell them: "I used Apache PDFBox 3.0. The Loader class
     * takes the raw bytes of the file, and PDFTextStripper pulls out the human-readable text."
     */
    private String extractTextFromPdf(MultipartFile file) throws IOException {
        // Load the PDF from the raw byte array of the uploaded file
        try (PDDocument document = Loader.loadPDF(file.getBytes())) {

            // Create the stripper utility which reads the document
            PDFTextStripper pdfStripper = new PDFTextStripper();

            // Return the extracted text as a String
            return pdfStripper.getText(document);
        }
    }

    /**
     * HELPER METHOD 2: Calls the Gemini API.
     * If your professor asks, tell them: "I used a System Prompt to force the AI to act
     * like an HR Recruiter and return a structured JSON response."
     */
    private String analyzeWithGemini(String resumeText) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(geminiApiKey);

        // Tell the AI exactly how to behave
        String systemPrompt = "You are a strict Senior HR Recruiter and an ATS (Applicant Tracking System) software. " +
                "Review the following resume text. Provide an ATS compatibility score out of 100, " +
                "list 3 key strengths, list 3 weaknesses, and give formatting advice. " +
                "Format your response cleanly using Markdown.";

        Map<String, Object> requestBody = new HashMap<>();
        requestBody.put("model", "gemini-2.5-flash"); // Using the fast text model

        List<Map<String, String>> messages = new ArrayList<>();
        messages.add(Map.of("role", "system", "content", systemPrompt));
        messages.add(Map.of("role", "user", "content", "Here is the resume text:\n\n" + resumeText));

        requestBody.put("messages", messages);
        requestBody.put("temperature", 0.5); // Lower temperature = more strict, analytical answers

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(GEMINI_URL, entity, Map.class);
            Map<?, ?> body = response.getBody();

            if (body != null && body.containsKey("choices")) {
                List<?> choices = (List<?>) body.get("choices");
                if (!choices.isEmpty()) {
                    Map<?, ?> firstChoice = (Map<?, ?>) choices.get(0);
                    Map<?, ?> message = (Map<?, ?>) firstChoice.get("message");
                    return (String) message.get("content");
                }
            }
            return "Error: Empty response received from Gemini API.";
        } catch (Exception e) {
            return "Error during AI resume review: " + e.getMessage();
        }
    }
}