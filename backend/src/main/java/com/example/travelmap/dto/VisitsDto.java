package com.example.travelmap.dto;

import java.util.List;

/** Everything a user has marked as visited. */
public record VisitsDto(List<String> states, List<String> countries, List<CityDto> cities) {
}
