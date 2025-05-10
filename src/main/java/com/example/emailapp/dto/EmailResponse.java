package com.example.emailapp.dto;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class EmailResponse {
    private Long id;
    private Long userId;
    private String fromEmail;
    private String fromName;
    private String toEmail;
    private String subject;
    private String body;
    private String status;
    private boolean read;
    private boolean starred;
    private LocalDateTime createdAt;
}