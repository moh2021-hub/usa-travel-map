package com.example.travelmap.dto;

import com.example.travelmap.entity.City;

public record CityDto(Long id, String name, String stateCode, double lat, double lon, int population) {

    public static CityDto from(City city) {
        return new CityDto(
                city.getId(), city.getName(), city.getStateCode(),
                city.getLat(), city.getLon(), city.getPopulation());
    }
}
