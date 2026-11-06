package com.example.travelmap.service;

import com.example.travelmap.dto.CityDto;
import com.example.travelmap.dto.MergeRequest;
import com.example.travelmap.dto.VisitsDto;
import com.example.travelmap.entity.City;
import com.example.travelmap.entity.RegionType;
import com.example.travelmap.exception.ApiException;
import com.example.travelmap.repository.CityRepository;
import com.example.travelmap.repository.StateRepository;
import com.example.travelmap.repository.VisitedCityRepository;
import com.example.travelmap.repository.VisitedRegionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;
import java.util.Objects;
import java.util.regex.Pattern;

/** Marking and unmarking the places a user has been. */
@Service
public class VisitService {

    /** Country codes come from the world map file: ISO numbers like "840", or "x-kosovo" where there is none. */
    private static final Pattern COUNTRY_CODE = Pattern.compile("^[A-Za-z0-9-]{1,40}$");

    private final StateRepository states;
    private final CityRepository cities;
    private final VisitedRegionRepository visitedRegions;
    private final VisitedCityRepository visitedCities;

    public VisitService(StateRepository states,
                        CityRepository cities,
                        VisitedRegionRepository visitedRegions,
                        VisitedCityRepository visitedCities) {
        this.states = states;
        this.cities = cities;
        this.visitedRegions = visitedRegions;
        this.visitedCities = visitedCities;
    }

    @Transactional(readOnly = true)
    public VisitsDto getVisits(Long userId) {
        return new VisitsDto(
                visitedRegions.findCodes(userId, RegionType.STATE.name()),
                visitedRegions.findCodes(userId, RegionType.COUNTRY.name()),
                cities.findVisitedByUser(userId).stream().map(CityDto::from).toList());
    }

    @Transactional
    public void addState(Long userId, String stateCode) {
        visitedRegions.add(userId, RegionType.STATE.name(), requireState(stateCode));
    }

    @Transactional
    public void removeState(Long userId, String stateCode) {
        visitedRegions.remove(userId, RegionType.STATE.name(), stateCode.trim().toUpperCase(Locale.ROOT));
    }

    @Transactional
    public void addCountry(Long userId, String countryCode) {
        visitedRegions.add(userId, RegionType.COUNTRY.name(), requireCountryCode(countryCode));
    }

    @Transactional
    public void removeCountry(Long userId, String countryCode) {
        visitedRegions.remove(userId, RegionType.COUNTRY.name(), countryCode);
    }

    /** Marks a city, and its state too: you cannot have been to Detroit without being in Michigan. */
    @Transactional
    public void addCity(Long userId, Long cityId) {
        City city = cities.findById(cityId)
                .orElseThrow(() -> ApiException.notFound("No city with id " + cityId));
        visitedCities.add(userId, city.getId());
        visitedRegions.add(userId, RegionType.STATE.name(), city.getStateCode());
    }

    @Transactional
    public void removeCity(Long userId, Long cityId) {
        visitedCities.remove(userId, cityId);
    }

    /**
     * Adds places picked while logged out to the account, then returns the full, combined list.
     * Nothing is ever removed here, and unknown codes are skipped rather than rejected,
     * because this data comes from whatever was sitting in the browser.
     */
    @Transactional
    public VisitsDto merge(Long userId, MergeRequest request) {
        for (String raw : orEmpty(request.states())) {
            String code = raw == null ? "" : raw.trim().toUpperCase(Locale.ROOT);
            if (states.existsById(code)) {
                visitedRegions.add(userId, RegionType.STATE.name(), code);
            }
        }
        for (String code : orEmpty(request.countries())) {
            if (code != null && COUNTRY_CODE.matcher(code).matches()) {
                visitedRegions.add(userId, RegionType.COUNTRY.name(), code);
            }
        }
        List<Long> cityIds = orEmpty(request.cityIds()).stream().filter(Objects::nonNull).distinct().toList();
        for (City city : cities.findAllById(cityIds)) {
            visitedCities.add(userId, city.getId());
            visitedRegions.add(userId, RegionType.STATE.name(), city.getStateCode());
        }
        return getVisits(userId);
    }

    private String requireState(String stateCode) {
        String code = stateCode.trim().toUpperCase(Locale.ROOT);
        if (!states.existsById(code)) {
            throw ApiException.notFound("No state with code " + code);
        }
        return code;
    }

    private String requireCountryCode(String countryCode) {
        if (!COUNTRY_CODE.matcher(countryCode).matches()) {
            throw ApiException.badRequest("Country code may only contain letters, numbers and dashes");
        }
        return countryCode;
    }

    private static <T> List<T> orEmpty(List<T> list) {
        return list == null ? List.of() : list;
    }
}
