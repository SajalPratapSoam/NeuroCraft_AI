package com.example.aistudio_backend.controller;

import com.example.aistudio_backend.dto.MockPaymentRequest;
import com.example.aistudio_backend.entity.Transaction;
import com.example.aistudio_backend.service.MockPaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payment")
@CrossOrigin(origins = "http://localhost:5173")
public class PaymentController {

    @Autowired
    private MockPaymentService mockPaymentService;

    // Process payment for any user
    @PostMapping("/mock-checkout")
    public ResponseEntity<?> mockCheckout(@RequestBody MockPaymentRequest request) {
        try {
            Transaction successfulTxn = mockPaymentService.processMockPayment(request.getPlan(), request.getEmail());

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Payment Successful!",
                    "transactionId", successfulTxn.getTransactionId(),
                    "userId", successfulTxn.getUserId(),
                    "plan", successfulTxn.getPlanPurchased()
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    // GET all payment history for all users
    @GetMapping("/history")
    public ResponseEntity<List<Transaction>> getAllPaymentHistory() {
        return ResponseEntity.ok(mockPaymentService.getAllTransactions());
    }
}