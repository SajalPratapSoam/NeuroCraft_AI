package com.example.aistudio_backend.service;

import com.example.aistudio_backend.dto.ArticleRequest;
import com.example.aistudio_backend.dto.BlogRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class OpenAiTextService {

    // 1. Point to your Gemini API Key
    @Value("${gemini.api.key}")
    private String geminiApiKey;

    // 2. Use Google's OpenAI-compatible REST endpoint
    private final String GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions";

    private final RestTemplate restTemplate = new RestTemplate();

    public String generateArticle(ArticleRequest request) {
        // ... (Keep your exact same prompt logic from before)
        String systemPrompt = "You are a professional article writer...";
        String userPrompt = String.format("Write an in-depth article on the topic: '%s'...", request.getTopic());

        return callApi(systemPrompt, userPrompt);
    }

    public String generateBlog(BlogRequest request) {
        // ... (Keep your exact same prompt logic from before)
        String systemPrompt = "You are an expert SEO content strategist...";
        String userPrompt = "Write a compelling blog post about: '" + request.getTopic() + "'...";

        return callApi(systemPrompt, userPrompt);
    }

    private String callApi(String systemPrompt, String userPrompt) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        // Gemini accepts the API key as a Bearer token in this compatibility mode
        headers.setBearerAuth(geminiApiKey);

        Map<String, Object> requestBody = new HashMap<>();

        // 3. Change the model to Gemini
        requestBody.put("model", "gemini-2.5-flash");

        List<Map<String, String>> messages = new ArrayList<>();
        messages.add(Map.of("role", "system", "content", systemPrompt));
        messages.add(Map.of("role", "user", "content", userPrompt));

        requestBody.put("messages", messages);
        requestBody.put("temperature", 0.7);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        try {
            // Call the Gemini URL instead of OpenAI
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
            return "Error: Empty response received from API.";
        } catch (Exception e) {
            return "Error during AI content generation: " + e.getMessage();
        }
    }
}