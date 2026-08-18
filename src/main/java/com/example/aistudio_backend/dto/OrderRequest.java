package com.example.aistudio_backend.dto;

import lombok.Data;

@Data
public class OrderRequest {
    private int amount; // Amount in USD/INR
    private String currency; // e.g., "usd" or "inr"
}