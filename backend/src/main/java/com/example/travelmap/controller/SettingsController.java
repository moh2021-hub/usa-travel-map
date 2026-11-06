package com.example.travelmap.controller;

import com.example.travelmap.config.CurrentUser;
import com.example.travelmap.dto.SettingsDto;
import com.example.travelmap.service.SettingsService;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** The logged-in user's map theme and label preference. */
@RestController
@RequestMapping("/api/me/settings")
public class SettingsController {

    private final SettingsService settingsService;

    public SettingsController(SettingsService settingsService) {
        this.settingsService = settingsService;
    }

    @GetMapping
    public SettingsDto get(@AuthenticationPrincipal Jwt jwt) {
        return settingsService.get(CurrentUser.id(jwt));
    }

    @PutMapping
    public SettingsDto save(@AuthenticationPrincipal Jwt jwt, @Valid @RequestBody SettingsDto request) {
        return settingsService.save(CurrentUser.id(jwt), request);
    }
}
