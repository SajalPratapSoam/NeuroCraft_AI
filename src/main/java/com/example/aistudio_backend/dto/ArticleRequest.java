package com.example.aistudio_backend.dto;

import lombok.Data;

@Data
public class ArticleRequest {
    private String topic;
    private String targetAudience;
    private String tone;
    private int wordCount;
}