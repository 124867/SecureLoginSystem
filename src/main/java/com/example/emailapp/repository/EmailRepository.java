package com.example.emailapp.repository;

import com.example.emailapp.model.Email;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EmailRepository extends JpaRepository<Email, Long> {
    List<Email> findByUserIdAndStatus(Long userId, String status);
    List<Email> findByUserIdAndStarredTrue(Long userId);
}