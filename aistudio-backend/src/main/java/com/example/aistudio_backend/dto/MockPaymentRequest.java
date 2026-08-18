package com.example.aistudio_backend.dto;

import lombok.Data;

@Data
public class MockPaymentRequest {
    private String plan; // Expecting "WEEKLY", "MONTHLY", or "YEARLY"
    private String email;
}