package com.example.aistudio_backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Random;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class OtpService {

    @Autowired
    private JavaMailSender mailSender;

    // Stores OTPs temporarily in memory (Email -> OTP)
    private final Map<String, String> otpStorage = new ConcurrentHashMap<>();

    // 1. Generate and Send OTP
    public void generateAndSendOtp(String email) {
        // Generate a 6-digit random OTP
        String otp = String.format("%06d", new Random().nextInt(999999));

        // Save it in memory
        otpStorage.put(email, otp);

        // Send it via Email
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(email);
        message.setSubject("Your AI Studio Verification Code");
        message.setText("Your OTP code is: " + otp + "\n\nThis code is valid for your current session.");

        mailSender.send(message);
    }

    // 2. Validate the OTP (THIS IS THE METHOD THAT WAS MISSING!)
    public boolean validateOtp(String email, String otp) {
        String storedOtp = otpStorage.get(email);

        if (storedOtp != null && storedOtp.equals(otp)) {
            otpStorage.remove(email); // Clear the OTP after successful use
            return true;
        }

        return false;
    }
}