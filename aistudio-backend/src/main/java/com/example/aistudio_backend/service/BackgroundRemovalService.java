package com.example.aistudio_backend.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

@Service
public class BackgroundRemovalService {

    @Value("${removebg.api.key}")
    private String removeBgApiKey;

    @Autowired
    private CloudinaryService cloudinaryService;

    private final String REMOVE_BG_URL = "https://api.remove.bg/v1.0/removebg";
    private final RestTemplate restTemplate = new RestTemplate();

    public String removeBackgroundAndSave(MultipartFile file) {
        try {
            // 1. Prepare Headers (Remove.bg uses a custom header for the API key)
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);
            headers.set("X-Api-Key", removeBgApiKey);

            // 2. Prepare the Form Data
            MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
            body.add("size", "auto"); // Tells the API to keep the original image size

            // We must wrap the uploaded file in a ByteArrayResource so RestTemplate can send it
            ByteArrayResource fileResource = new ByteArrayResource(file.getBytes()) {
                @Override
                public String getFilename() {
                    return file.getOriginalFilename();
                }
            };
            body.add("image_file", fileResource);

            HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

            // 3. Call the Remove.bg API (It returns a raw PNG image as a byte array)
            ResponseEntity<byte[]> response = restTemplate.postForEntity(REMOVE_BG_URL, requestEntity, byte[].class);
            byte[] transparentImageBytes = response.getBody();

            if (transparentImageBytes != null && transparentImageBytes.length > 0) {
                // 4. Upload the transparent image bytes to Cloudinary
                return cloudinaryService.uploadImageBytes(transparentImageBytes);
            }

            return "Error: Empty response received from Remove.bg API.";

        } catch (Exception e) {
            return "Error during background removal: " + e.getMessage();
        }
    }
}