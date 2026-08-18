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
    private int credits;

    private String currentPlan;
    private LocalDateTime planExpiryDate;
    private boolean freePlanUsed;
}