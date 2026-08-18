package com.example.aistudio_backend.dto;

import lombok.Data;

@Data
public class OrderRequest {
    private int amount;
    private String currency;
}