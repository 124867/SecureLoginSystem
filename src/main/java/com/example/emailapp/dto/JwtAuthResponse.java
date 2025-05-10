package com.example.emailapp.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class JwtAuthResponse {
    private String token;
    private String tokenType = "Bearer";
    private Long userId;
    private String username;
    private String email;
    private String name;
    
    public JwtAuthResponse(String token, Long userId, String username, String email, String name) {
        this.token = token;
        this.userId = userId;
        this.username = username;
        this.email = email;
        this.name = name;
    }
}