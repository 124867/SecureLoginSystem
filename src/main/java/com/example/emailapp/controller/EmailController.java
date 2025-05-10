package com.example.emailapp.controller;

import com.example.emailapp.dto.EmailRequest;
import com.example.emailapp.model.Email;
import com.example.emailapp.service.EmailService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/emails")
public class EmailController {

    private final EmailService emailService;

    public EmailController(EmailService emailService) {
        this.emailService = emailService;
    }

    @GetMapping("/{folder}")
    public ResponseEntity<List<Email>> getEmailsByFolder(@PathVariable String folder) {
        try {
            List<Email> emails = emailService.getEmailsByFolder(folder);
            return ResponseEntity.ok(emails);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/view/{id}")
    public ResponseEntity<?> getEmailById(@PathVariable Long id) {
        try {
            Email email = emailService.getEmailById(id);
            
            // Mark email as read if it's not already
            if (!email.isRead()) {
                emailService.markEmailAsRead(id, true);
            }
            
            return ResponseEntity.ok(email);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        }
    }

    @PostMapping
    public ResponseEntity<?> sendEmail(@Valid @RequestBody EmailRequest emailRequest) {
        try {
            Email email = emailService.sendEmail(emailRequest);
            return ResponseEntity.status(HttpStatus.CREATED).body(email);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateEmailStatus(@PathVariable Long id, @RequestBody Map<String, String> statusRequest) {
        try {
            String status = statusRequest.get("status");
            if (status == null) {
                return ResponseEntity.badRequest().body("Status is required");
            }
            
            Email email = emailService.updateEmailStatus(id, status);
            return ResponseEntity.ok(email);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    @PatchMapping("/{id}/read")
    public ResponseEntity<?> markEmailAsRead(@PathVariable Long id, @RequestBody Map<String, Boolean> readRequest) {
        try {
            Boolean read = readRequest.get("read");
            if (read == null) {
                return ResponseEntity.badRequest().body("Read parameter is required");
            }
            
            Email email = emailService.markEmailAsRead(id, read);
            return ResponseEntity.ok(email);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    @PatchMapping("/{id}/star")
    public ResponseEntity<?> markEmailAsStarred(@PathVariable Long id, @RequestBody Map<String, Boolean> starRequest) {
        try {
            Boolean starred = starRequest.get("starred");
            if (starred == null) {
                return ResponseEntity.badRequest().body("Starred parameter is required");
            }
            
            Email email = emailService.markEmailAsStarred(id, starred);
            return ResponseEntity.ok(email);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteEmail(@PathVariable Long id) {
        try {
            emailService.deleteEmail(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }
    }
}