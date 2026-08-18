package com.example.aistudio_backend.repository;

import com.example.aistudio_backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    // We will use this later when we integrate JWT login
    User findByEmail(String email);
}