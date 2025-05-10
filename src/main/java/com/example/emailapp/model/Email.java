package com.example.emailapp.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
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
    
    @Column(nullable = false)
    private String fromEmail;
    
    @Column(nullable = false)
    private String fromName;
    
    @Column(nullable = false)
    private String toEmail;
    
    @Column(nullable = false)
    private String subject;
    
    @Column(nullable = false, length = 10000)
    private String body;
    
    @Column(nullable = false)
    private String status;  // "inbox", "sent", "archived", "trash", "starred"
    
    @Column(nullable = false)
    private boolean read;
    
    @Column(nullable = false)
    private boolean starred;
    
    @Column(nullable = false)
    private LocalDateTime createdAt;
    
    @PrePersist
    protected void onCreate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
    }
}