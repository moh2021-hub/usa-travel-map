package com.example.travelmap.dto;

import java.util.List;

/** What anyone with a share link can see: a name and the map, never the email address. */
public record SharedMapDto(
        String displayName,
        String theme,
        boolean showLabels,
        List<String> states,
        List<String> countries,
        List<CityDto> cities) {
}
