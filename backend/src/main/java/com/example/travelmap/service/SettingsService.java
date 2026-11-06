package com.example.travelmap.service;

import com.example.travelmap.dto.SettingsDto;
import com.example.travelmap.entity.MapSettings;
import com.example.travelmap.repository.MapSettingsRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SettingsService {

    private final MapSettingsRepository settings;

    public SettingsService(MapSettingsRepository settings) {
        this.settings = settings;
    }

    /** A user who has never saved settings gets the defaults. */
    @Transactional(readOnly = true)
    public SettingsDto get(Long userId) {
        return SettingsDto.from(settings.findById(userId).orElseGet(() -> new MapSettings(userId)));
    }

    @Transactional
    public SettingsDto save(Long userId, SettingsDto request) {
        MapSettings row = settings.findById(userId).orElseGet(() -> new MapSettings(userId));
        row.setTheme(request.theme());
        row.setShowLabels(request.showLabels());
        return SettingsDto.from(settings.save(row));
    }
}
