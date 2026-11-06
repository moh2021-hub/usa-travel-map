package com.example.travelmap.dto;

import com.example.travelmap.entity.MapSettings;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public record SettingsDto(
        @NotNull(message = "Choose a theme")
        @Pattern(regexp = "^[a-z]{1,20}$", message = "Unknown theme")
        String theme,

        @NotNull(message = "showLabels is required")
        Boolean showLabels) {

    public static SettingsDto from(MapSettings settings) {
        return new SettingsDto(settings.getTheme(), settings.isShowLabels());
    }
}
