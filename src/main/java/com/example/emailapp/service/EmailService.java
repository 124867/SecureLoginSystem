package com.example.emailapp.service;

import com.example.emailapp.dto.EmailRequest;
import com.example.emailapp.model.Email;
import com.example.emailapp.model.User;
import com.example.emailapp.repository.EmailRepository;
import com.example.emailapp.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class EmailService {

    private final EmailRepository emailRepository;
    private final UserRepository userRepository;
    private final UserService userService;

    public EmailService(EmailRepository emailRepository, UserRepository userRepository, UserService userService) {
        this.emailRepository = emailRepository;
        this.userRepository = userRepository;
        this.userService = userService;
    }

    @Transactional
    public Email sendEmail(EmailRequest emailRequest) {
        User currentUser = userService.getCurrentUser();

        Email email = new Email();
        email.setUser(currentUser);
        email.setFromEmail(currentUser.getEmail());
        email.setFromName(currentUser.getUsername());
        email.setToEmail(emailRequest.getToEmail());
        email.setSubject(emailRequest.getSubject());
        email.setBody(emailRequest.getBody());
        email.setStatus(Email.EmailStatus.SENT);
        email.setRead(true);
        email.setStarred(false);

        return emailRepository.save(email);
    }

    public List<Email> getEmailsByFolder(String folder) {
        User currentUser = userService.getCurrentUser();
        
        if ("starred".equals(folder)) {
            return emailRepository.findByUserAndStarredTrue(currentUser);
        } else {
            Email.EmailStatus status = Email.EmailStatus.valueOf(folder.toUpperCase());
            return emailRepository.findByUserAndStatus(currentUser, status);
        }
    }

    public Email getEmailById(Long id) {
        User currentUser = userService.getCurrentUser();
        
        Email email = emailRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Email not found"));
        
        // Check if the email belongs to the current user
        if (!email.getUser().getId().equals(currentUser.getId())) {
            throw new RuntimeException("Access denied");
        }
        
        return email;
    }
    
    @Transactional
    public Email updateEmailStatus(Long id, String status) {
        Email email = getEmailById(id);
        email.setStatus(Email.EmailStatus.valueOf(status.toUpperCase()));
        return emailRepository.save(email);
    }
    
    @Transactional
    public Email markEmailAsRead(Long id, boolean read) {
        Email email = getEmailById(id);
        email.setRead(read);
        return emailRepository.save(email);
    }
    
    @Transactional
    public Email markEmailAsStarred(Long id, boolean starred) {
        Email email = getEmailById(id);
        email.setStarred(starred);
        return emailRepository.save(email);
    }
    
    @Transactional
    public void deleteEmail(Long id) {
        // Get email to check ownership
        Email email = getEmailById(id);
        emailRepository.delete(email);
    }
}