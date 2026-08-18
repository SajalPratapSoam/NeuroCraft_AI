package com.example.aistudio_backend.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Map;

@Service
public class CloudinaryService {

    @Autowired
    private Cloudinary cloudinary;

    /**
     * Downloads an image from a URL and uploads it to Cloudinary.
     */
    public String uploadFromUrl(String imageUrl) {
        try {
            Map<?, ?> result = cloudinary.uploader().upload(
                    imageUrl,
                    ObjectUtils.asMap("folder", "ai_studio/images")
            );
            return result.get("secure_url").toString();
        } catch (IOException e) {
            throw new RuntimeException("Cloudinary upload failed: " + e.getMessage(), e);
        }
    }

    /**
     * (We will use this later for the Background Removal feature)
     */
    public String uploadMultipartFile(MultipartFile file) {
        try {
            Map<?, ?> result = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap("folder", "ai_studio/uploads")
            );
            return result.get("secure_url").toString();
        } catch (IOException e) {
            throw new RuntimeException("Cloudinary file upload failed: " + e.getMessage(), e);
        }
    }
    /**
     * Uploads raw image bytes (e.g. from Google Imagen Base64 output) to Cloudinary.
     */
    public String uploadImageBytes(byte[] imageBytes) {
        try {
            Map<?, ?> result = cloudinary.uploader().upload(
                    imageBytes,
                    ObjectUtils.asMap("folder", "ai_studio/images")
            );
            return result.get("secure_url").toString();
        } catch (IOException e) {
            throw new RuntimeException("Cloudinary byte upload failed: " + e.getMessage(), e);
        }
    }
}