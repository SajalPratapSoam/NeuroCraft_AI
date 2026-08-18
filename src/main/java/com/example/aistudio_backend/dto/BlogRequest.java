package com.example.aistudio_backend.dto;



import lombok.Data;

@Data
public class BlogRequest {
    private String topic;
    private String keywords;
    private String tone;
    private boolean includeSeoMetadata;
}