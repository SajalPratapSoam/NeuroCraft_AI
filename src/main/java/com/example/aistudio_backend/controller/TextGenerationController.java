package com.example.aistudio_backend.controller;

import com.example.aistudio_backend.dto.ArticleRequest;
import com.example.aistudio_backend.dto.BlogRequest;
import com.example.aistudio_backend.service.OpenAiTextService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "http://localhost:5173")
public class TextGenerationController {

    @Autowired
    private OpenAiTextService openAiTextService;

    @PostMapping("/generate-article")
    public ResponseEntity<Map<String, String>> generateArticle(@RequestBody ArticleRequest request) {
        String generatedArticle = openAiTextService.generateArticle(request);
        return ResponseEntity.ok(Map.of("content", generatedArticle));
    }

    @PostMapping("/generate-blog")
    public ResponseEntity<Map<String, String>> generateBlog(@RequestBody BlogRequest request) {
        String generatedBlog = openAiTextService.generateBlog(request);
        return ResponseEntity.ok(Map.of("content", generatedBlog));
    }
}