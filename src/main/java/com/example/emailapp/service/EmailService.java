package com.example.emailapp.service;

import com.example.emailapp.dto.EmailRequest;
import com.example.emailapp.dto.EmailResponse;
import com.example.emailapp.exception.ResourceNotFoundException;
import com.example.emailapp.model.Email;
import com.example.emailapp.model.User;
import com.example.emailapp.repository.EmailRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class EmailService {
    
    private final EmailRepository emailRepository;
    
    public EmailService(EmailRepository emailRepository) {
        this.emailRepository = emailRepository;
    }
    
    public List<EmailResponse> getUserEmails(Long userId, String status) {
        List<Email> emails;
        if (status.equals("starred")) {
            emails = emailRepository.findByUserIdAndStarredTrue(userId);
        } else {
            emails = emailRepository.findByUserIdAndStatus(userId, status);
        }
        
        return emails.stream()
                .map(this::mapToEmailResponse)
                .collect(Collectors.toList());
    }
    
    public EmailResponse getEmailById(Long id, Long userId) {
        Email email = emailRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Email", "id", id));
        
        if (!email.getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("Email", "id", id);
        }
        
        return mapToEmailResponse(email);
    }
    
    public EmailResponse createEmail(EmailRequest emailRequest, User user) {
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
        
        // If recipient is a user in our system, create an inbox email for them
        // This would require additional code to look up the recipient
        
        return mapToEmailResponse(savedEmail);
    }
    
    public EmailResponse updateEmailStatus(Long id, String status, Long userId) {
        Email email = validateEmailOwnership(id, userId);
        
        email.setStatus(status);
        Email updatedEmail = emailRepository.save(email);
        
        return mapToEmailResponse(updatedEmail);
    }
    
    public EmailResponse markEmailAsRead(Long id, boolean read, Long userId) {
        Email email = validateEmailOwnership(id, userId);
        
        email.setRead(read);
        Email updatedEmail = emailRepository.save(email);
        
        return mapToEmailResponse(updatedEmail);
    }
    
    public EmailResponse starEmail(Long id, boolean starred, Long userId) {
        Email email = validateEmailOwnership(id, userId);
        
        email.setStarred(starred);
        Email updatedEmail = emailRepository.save(email);
        
        return mapToEmailResponse(updatedEmail);
    }
    
    public boolean deleteEmail(Long id, Long userId) {
        Email email = validateEmailOwnership(id, userId);
        
        emailRepository.delete(email);
        return true;
    }
    
    private Email validateEmailOwnership(Long emailId, Long userId) {
        Email email = emailRepository.findById(emailId)
                .orElseThrow(() -> new ResourceNotFoundException("Email", "id", emailId));
        
        if (!email.getUser().getId().equals(userId)) {
            throw new ResourceNotFoundException("Email", "id", emailId);
        }
        
        return email;
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