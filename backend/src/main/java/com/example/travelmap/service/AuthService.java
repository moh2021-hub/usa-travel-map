package com.example.travelmap.service;

import com.example.travelmap.dto.AuthResponse;
import com.example.travelmap.dto.LoginRequest;
import com.example.travelmap.dto.RegisterRequest;
import com.example.travelmap.dto.UserDto;
import com.example.travelmap.entity.User;
import com.example.travelmap.exception.ApiException;
import com.example.travelmap.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.util.Locale;

@Service
public class AuthService {

    private final UserRepository users;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthService(UserRepository users, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.users = users;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = normalize(request.email());
        // BCrypt only reads the first 72 bytes, and accented letters or emoji take more than one byte each.
        if (request.password().getBytes(StandardCharsets.UTF_8).length > 72) {
            throw ApiException.badRequest("Password is too long");
        }
        if (users.existsByEmail(email)) {
            throw new ApiException(HttpStatus.CONFLICT, "An account with this email already exists");
        }
        User user = users.save(new User(
                email,
                passwordEncoder.encode(request.password()),
                request.displayName().trim()));
        return new AuthResponse(jwtService.createToken(user), UserDto.from(user));
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        // Same message for "no such email" and "wrong password", so nobody can probe which emails have accounts.
        User user = users.findByEmail(normalize(request.email()))
                .filter(found -> passwordMatches(request.password(), found))
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Email or password is incorrect"));
        return new AuthResponse(jwtService.createToken(user), UserDto.from(user));
    }

    @Transactional(readOnly = true)
    public UserDto getUser(Long userId) {
        return users.findById(userId)
                .map(UserDto::from)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "This account no longer exists"));
    }

    private boolean passwordMatches(String rawPassword, User user) {
        // A registered password is never over 72 bytes, so anything longer cannot match.
        return rawPassword.getBytes(StandardCharsets.UTF_8).length <= 72
                && passwordEncoder.matches(rawPassword, user.getPasswordHash());
    }

    private String normalize(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }
}
