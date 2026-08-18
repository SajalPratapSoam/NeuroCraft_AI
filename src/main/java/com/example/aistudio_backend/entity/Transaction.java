package com.example.aistudio_backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.time.LocalDateTime;

@Entity
@Table(name = "transactions")
@Data
public class Transaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long userId;
    private String transactionId; // The fake Razorpay/Stripe ID
    private String planPurchased; // "WEEKLY", "MONTHLY", "YEARLY"
    private int amountPaid;
    private LocalDateTime paymentDate;
}