package com.example.emailapp.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class EmailRequest {
    @NotBlank(message = "Recipient email is required")
    @Email(message = "Please provide a valid email address")
    private String toEmail;
    
    @NotBlank(message = "Subject is required")
    private String subject;
    
    @NotBlank(message = "Email body is required")
    private String body;
}