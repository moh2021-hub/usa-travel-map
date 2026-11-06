package com.example.travelmap.controller;

import com.example.travelmap.config.CurrentUser;
import com.example.travelmap.dto.ShareLinkDto;
import com.example.travelmap.dto.SharedMapDto;
import com.example.travelmap.service.ShareService;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/share")
public class ShareController {

    private final ShareService shareService;

    public ShareController(ShareService shareService) {
        this.shareService = shareService;
    }

    /** Needs login. Returns the same link every time for the same user. */
    @PostMapping
    public ShareLinkDto createLink(@AuthenticationPrincipal Jwt jwt) {
        return shareService.getOrCreateLink(CurrentUser.id(jwt));
    }

    /** Public: anyone with the link can view the map. */
    @GetMapping("/{slug}")
    public SharedMapDto view(@PathVariable("slug") String slug) {
        return shareService.getSharedMap(slug);
    }
}
