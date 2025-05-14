package com.example.emailapp.controller;

import com.example.emailapp.dto.ApiResponse;
import com.example.emailapp.dto.EmailRequest;
import com.example.emailapp.dto.EmailResponse;
import com.example.emailapp.exception.ResourceNotFoundException;
import com.example.emailapp.model.Email;
import com.example.emailapp.model.User;
import com.example.emailapp.repository.EmailRepository;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/emails")
public class EmailController {

    private final EmailRepository emailRepository;

    public EmailController(EmailRepository emailRepository) {
        this.emailRepository = emailRepository;
    }

    @GetMapping
    public ResponseEntity<List<EmailResponse>> getUserEmails(
            @RequestParam(value = "status", defaultValue = "inbox") String status,
            Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        
        List<Email> emails;
        if (status.equals("starred")) {
            emails = emailRepository.findByUserIdAndStarredTrue(user.getId());
        } else {
            emails = emailRepository.findByUserIdAndStatus(user.getId(), status);
        }
        
        List<EmailResponse> emailResponses = emails.stream()
                .map(this::mapToEmailResponse)
                .collect(Collectors.toList());
                
        return ResponseEntity.ok(emailResponses);
    }

    @GetMapping("/{id}")
    public ResponseEntity<EmailResponse> getEmailById(@PathVariable Long id, Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        
        Email email = emailRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Email", "id", id));
        
        // Check if the email belongs to the authenticated user
        if (!email.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        return ResponseEntity.ok(mapToEmailResponse(email));
    }

    @PostMapping
    public ResponseEntity<EmailResponse> createEmail(
            @Valid @RequestBody EmailRequest emailRequest,
            Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        
        Email email = new Email();
        email.setUser(user);
        email.setFromEmail(user.getEmail());
        email.setFromName(user.getName());
        email.setToEmail(emailRequest.getToEmail());
        email.setSubject(emailRequest.getSubject());
        email.setBody(emailRequest.getBody());
        email.setStatus("sent");
        email.setRead(true);
        email.setStarred(false);
        email.setCreatedAt(LocalDateTime.now());
        
        Email savedEmail = emailRepository.save(email);
        
        return new ResponseEntity<>(mapToEmailResponse(savedEmail), HttpStatus.CREATED);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<EmailResponse> updateEmailStatus(
            @PathVariable Long id,
            @RequestParam String status,
            Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        
        Email email = emailRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Email", "id", id));
        
        // Check if the email belongs to the authenticated user
        if (!email.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        email.setStatus(status);
        Email updatedEmail = emailRepository.save(email);
        
        return ResponseEntity.ok(mapToEmailResponse(updatedEmail));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<EmailResponse> markEmailAsRead(
            @PathVariable Long id,
            @RequestParam boolean read,
            Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        
        Email email = emailRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Email", "id", id));
        
        // Check if the email belongs to the authenticated user
        if (!email.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        email.setRead(read);
        Email updatedEmail = emailRepository.save(email);
        
        return ResponseEntity.ok(mapToEmailResponse(updatedEmail));
    }

    @PutMapping("/{id}/star")
    public ResponseEntity<EmailResponse> starEmail(
            @PathVariable Long id,
            @RequestParam boolean starred,
            Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        
        Email email = emailRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Email", "id", id));
        
        // Check if the email belongs to the authenticated user
        if (!email.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        email.setStarred(starred);
        Email updatedEmail = emailRepository.save(email);
        
        return ResponseEntity.ok(mapToEmailResponse(updatedEmail));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse> deleteEmail(@PathVariable Long id, Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        
        Email email = emailRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Email", "id", id));
        
        // Check if the email belongs to the authenticated user
        if (!email.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        emailRepository.delete(email);
        
        return ResponseEntity.ok(new ApiResponse(true, "Email deleted successfully"));
    }

    private EmailResponse mapToEmailResponse(Email email) {
        return EmailResponse.builder()
                .id(email.getId())
                .userId(email.getUser().getId())
                .fromEmail(email.getFromEmail())
                .fromName(email.getFromName())
                .toEmail(email.getToEmail())
                .subject(email.getSubject())
                .body(email.getBody())
                .status(email.getStatus())
                .read(email.isRead())
                .starred(email.isStarred())
                .createdAt(email.getCreatedAt())
                .build();
    }
}