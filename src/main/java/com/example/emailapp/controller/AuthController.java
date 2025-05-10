package com.example.emailapp.controller;

import com.example.emailapp.dto.LoginRequest;
import com.example.emailapp.dto.RegisterRequest;
import com.example.emailapp.model.User;
import com.example.emailapp.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterRequest registerRequest) {
        try {
            User user = userService.registerUser(registerRequest);
            
            // Generate token after registration
            String jwt = userService.loginUser(new LoginRequest(registerRequest.getUsername(), registerRequest.getPassword()));
            
            Map<String, Object> response = new HashMap<>();
            response.put("user", user);
            response.put("token", jwt);
            
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginUser(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            String jwt = userService.loginUser(loginRequest);
            User user = userService.getCurrentUser();
            
            Map<String, Object> response = new HashMap<>();
            response.put("user", user);
            response.put("token", jwt);
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials");
        }
    }

    @GetMapping("/user")
    public ResponseEntity<?> getCurrentUser() {
        try {
            User currentUser = userService.getCurrentUser();
            return ResponseEntity.ok(currentUser);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        }
    }
}