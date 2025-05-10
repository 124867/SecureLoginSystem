package com.example.emailapp.repository;

import com.example.emailapp.model.Email;
import com.example.emailapp.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EmailRepository extends JpaRepository<Email, Long> {
    List<Email> findByUserAndStatus(User user, Email.EmailStatus status);
    List<Email> findByUserAndStarredTrue(User user);
}