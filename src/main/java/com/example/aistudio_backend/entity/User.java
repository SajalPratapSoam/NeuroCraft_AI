package com.example.aistudio_backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
@Data
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String email;
    private String password;
    private int credits; // Number of AI generations remaining

    private String currentPlan; // "FREE", "WEEKLY", "MONTHLY", "YEARLY"
    private LocalDateTime planExpiryDate;
}