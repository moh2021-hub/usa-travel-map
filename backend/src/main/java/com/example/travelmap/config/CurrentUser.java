package com.example.travelmap.config;

import org.springframework.security.oauth2.jwt.Jwt;

/** Reads the logged-in user's id out of their token. The id is stored as the token's "subject". */
public final class CurrentUser {

    private CurrentUser() {
    }

    public static Long id(Jwt jwt) {
        return Long.valueOf(jwt.getSubject());
    }
}
