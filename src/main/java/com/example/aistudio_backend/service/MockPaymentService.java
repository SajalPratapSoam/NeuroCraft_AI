package com.example.aistudio_backend.service;

import com.example.aistudio_backend.entity.Transaction;
import com.example.aistudio_backend.entity.User;
import com.example.aistudio_backend.repository.TransactionRepository;
import com.example.aistudio_backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
public class MockPaymentService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    public Transaction processMockPayment(String planType, String userEmail) {
        // Default to student@college.edu if no email provided
        String targetEmail = (userEmail != null && !userEmail.trim().isEmpty())
                ? userEmail
                : "student@college.edu";

        // 1. Find existing user by email or create a new user record
        User user = userRepository.findByEmail(targetEmail);
        if (user == null) {
            user = new User();
            user.setEmail(targetEmail);
            user.setCredits(10);
            user.setCurrentPlan("FREE");
            user = userRepository.save(user);
        }

        // 2. Determine credits and pricing
        int creditsToAdd;
        int price;
        LocalDateTime expiryDate = LocalDateTime.now();

        switch (planType.toUpperCase()) {
            case "WEEKLY":
                creditsToAdd = 50;
                price = 199;
                expiryDate = expiryDate.plusWeeks(1);
                break;
            case "MONTHLY":
                creditsToAdd = 300;
                price = 499;
                expiryDate = expiryDate.plusMonths(1);
                break;
            case "YEARLY":
                creditsToAdd = 5000;
                price = 3999;
                expiryDate = expiryDate.plusYears(1);
                break;
            default:
                throw new IllegalArgumentException("Invalid plan selected");
        }

        // 3. Update User credits & active plan
        user.setCredits(user.getCredits() + creditsToAdd);
        user.setCurrentPlan(planType.toUpperCase());
        user.setPlanExpiryDate(expiryDate);
        userRepository.save(user);

        // 4. Append a BRAND NEW transaction record into transactions table
        Transaction transaction = new Transaction();
        transaction.setUserId(user.getId());
        transaction.setPlanPurchased(planType.toUpperCase());
        transaction.setAmountPaid(price);
        transaction.setPaymentDate(LocalDateTime.now());
        transaction.setTransactionId("TXN-" + UUID.randomUUID().toString().substring(0, 10).toUpperCase());

        return transactionRepository.save(transaction);
    }

    /**
     * Returns all payment records ever made across all users.
     */
    public List<Transaction> getAllTransactions() {
        return transactionRepository.findAll();
    }
}