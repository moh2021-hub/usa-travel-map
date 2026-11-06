package com.example.travelmap.controller;

import com.example.travelmap.config.CurrentUser;
import com.example.travelmap.dto.AuthResponse;
import com.example.travelmap.dto.LoginRequest;
import com.example.travelmap.dto.RegisterRequest;
import com.example.travelmap.dto.UserDto;
import com.example.travelmap.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/api/auth/register")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponse register(@Valid @RequestBody RegisterRequest request) {
        return authService.register(request);
    }

    @PostMapping("/api/auth/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    /** Who am I? Used by the frontend to check a saved token still works. */
    @GetMapping("/api/me")
    public UserDto me(@AuthenticationPrincipal Jwt jwt) {
        return authService.getUser(CurrentUser.id(jwt));
    }
}
