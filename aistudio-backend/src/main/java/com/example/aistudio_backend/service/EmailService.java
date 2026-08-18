package com.example.aistudio_backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    // @Async makes this run in the background without blocking the HTTP request thread
    @Async
    public void sendOtpEmail(String toEmail, String otp) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(toEmail);
            message.setSubject("AI Studio - Your Verification Code");
            message.setText("Your One-Time Password (OTP) is: " + otp
                    + "\n\nThis code will expire in 5 minutes.");

            mailSender.send(message);
            System.out.println("Async email dispatched successfully to: " + toEmail);
        } catch (Exception e) {
            System.err.println("Failed to send OTP email: " + e.getMessage());
        }
    }
}