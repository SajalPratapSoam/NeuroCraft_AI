package com.example.aistudio_backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

@Service
public class ImageGenerationService {

    @Value("${clipdrop.api.key}")
    private String clipdropApiKey;

    @Autowired
    private CloudinaryService cloudinaryService;

    // The correct Clipdrop Image Generation Endpoint
    private final String CLIPDROP_URL = "https://clipdrop-api.co/text-to-image/v1";
    private final RestTemplate restTemplate = new RestTemplate();

    public String generateAndSaveImage(String prompt) {
        HttpHeaders headers = new HttpHeaders();
        // Clipdrop strictly requires multipart/form-data
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);
        headers.set("x-api-key", clipdropApiKey);

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("prompt", prompt);

        HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

        try {
            // Call Clipdrop API
            ResponseEntity<byte[]> response = restTemplate.postForEntity(CLIPDROP_URL, requestEntity, byte[].class);
            byte[] imageBytes = response.getBody();

            // If successful, upload the raw bytes directly to Cloudinary
            if (imageBytes != null && imageBytes.length > 0) {
                return cloudinaryService.uploadImageBytes(imageBytes);
            }

            return "Error: Empty response received from Clipdrop API.";

        } catch (Exception e) {
            return "Error during Image Generation: " + e.getMessage();
        }
    }
}