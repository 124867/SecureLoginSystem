package com.example.emailapp.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "emails")
public class Email {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
    
    @Column(name = "from_email", nullable = false)
    private String fromEmail;
    
    @Column(name = "from_name", nullable = false)
    private String fromName;
    
    @Column(name = "to_email", nullable = false)
    private String toEmail;
    
    @Column(nullable = false)
    private String subject;
    
    @Column(columnDefinition = "TEXT", nullable = false)
    private String body;
    
    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private EmailStatus status;
    
    @Column(nullable = false)
    private boolean read;
    
    @Column(nullable = false)
    private boolean starred;
    
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
    
    public enum EmailStatus {
        INBOX, SENT, ARCHIVED, TRASH, STARRED
    }
}