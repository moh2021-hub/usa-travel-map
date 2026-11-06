package com.example.travelmap.dto;

/** Returned after register and login. The client sends the token back as "Authorization: Bearer ...". */
public record AuthResponse(String token, UserDto user) {
}
