package com.example.travelmap.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank(message = "Enter your email address")
        @Email(message = "Enter a valid email address")
        @Size(max = 255, message = "Email is too long")
        String email,

        @NotBlank(message = "Enter a password")
        @Size(min = 8, max = 72, message = "Password must be 8 to 72 characters")
        String password,

        @NotBlank(message = "Enter a name to show on your map")
        @Size(max = 60, message = "Name must be 60 characters or fewer")
        String displayName) {
}
