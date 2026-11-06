package com.example.travelmap.service;

import com.example.travelmap.dto.SettingsDto;
import com.example.travelmap.dto.ShareLinkDto;
import com.example.travelmap.dto.SharedMapDto;
import com.example.travelmap.dto.VisitsDto;
import com.example.travelmap.entity.SharedMap;
import com.example.travelmap.entity.User;
import com.example.travelmap.exception.ApiException;
import com.example.travelmap.repository.SharedMapRepository;
import com.example.travelmap.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;

/**
 * Public share links. A link always shows the owner's map as it is right now,
 * so they never need to make a new link after adding places.
 */
@Service
public class ShareService {

    private static final String SLUG_CHARACTERS = "abcdefghjkmnpqrstuvwxyz23456789"; // no look-alikes: i l o 0 1
    private static final int SLUG_LENGTH = 10;

    private final SecureRandom random = new SecureRandom();
    private final SharedMapRepository sharedMaps;
    private final UserRepository users;
    private final VisitService visitService;
    private final SettingsService settingsService;

    public ShareService(SharedMapRepository sharedMaps,
                        UserRepository users,
                        VisitService visitService,
                        SettingsService settingsService) {
        this.sharedMaps = sharedMaps;
        this.users = users;
        this.visitService = visitService;
        this.settingsService = settingsService;
    }

    /** Returns the user's share link, creating it the first time. */
    @Transactional
    public ShareLinkDto getOrCreateLink(Long userId) {
        SharedMap link = sharedMaps.findByUserId(userId)
                .orElseGet(() -> sharedMaps.save(new SharedMap(newSlug(), userId)));
        return new ShareLinkDto(link.getSlug());
    }

    @Transactional(readOnly = true)
    public SharedMapDto getSharedMap(String slug) {
        SharedMap link = sharedMaps.findById(slug)
                .orElseThrow(() -> ApiException.notFound("This share link does not exist"));
        User owner = users.findById(link.getUserId())
                .orElseThrow(() -> ApiException.notFound("This share link does not exist"));
        VisitsDto visits = visitService.getVisits(owner.getId());
        SettingsDto settings = settingsService.get(owner.getId());
        return new SharedMapDto(
                owner.getDisplayName(),
                settings.theme(),
                settings.showLabels(),
                visits.states(),
                visits.countries(),
                visits.cities());
    }

    private String newSlug() {
        StringBuilder slug = new StringBuilder(SLUG_LENGTH);
        for (int i = 0; i < SLUG_LENGTH; i++) {
            slug.append(SLUG_CHARACTERS.charAt(random.nextInt(SLUG_CHARACTERS.length())));
        }
        return slug.toString();
    }
}
