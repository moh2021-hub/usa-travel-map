package com.example.travelmap.service;

import com.example.travelmap.dto.CityDto;
import com.example.travelmap.dto.StateDto;
import com.example.travelmap.exception.ApiException;
import com.example.travelmap.repository.CityRepository;
import com.example.travelmap.repository.StateRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;

/** Read-only lookups of states and cities. */
@Service
@Transactional(readOnly = true)
public class CityService {

    private static final int MAX_SEARCH_RESULTS = 25;

    private final StateRepository states;
    private final CityRepository cities;

    public CityService(StateRepository states, CityRepository cities) {
        this.states = states;
        this.cities = cities;
    }

    public List<StateDto> listStates() {
        return states.findAllByOrderByNameAsc().stream().map(StateDto::from).toList();
    }

    public List<CityDto> citiesInState(String stateCode, int minPopulation) {
        String code = requireState(stateCode);
        return cities.findByStateCodeAndPopulationGreaterThanEqualOrderByPopulationDesc(code, minPopulation)
                .stream().map(CityDto::from).toList();
    }

    /** Cities whose name starts with the typed text, biggest first. stateCode is optional. */
    public List<CityDto> search(String text, String stateCode, int limit) {
        String prefix = text == null ? "" : text.trim();
        if (prefix.isEmpty()) {
            return List.of();
        }
        Pageable page = PageRequest.of(0, Math.max(1, Math.min(limit, MAX_SEARCH_RESULTS)));
        var found = (stateCode == null || stateCode.isBlank())
                ? cities.findByNameStartingWithIgnoreCaseOrderByPopulationDesc(prefix, page)
                : cities.findByStateCodeAndNameStartingWithIgnoreCaseOrderByPopulationDesc(
                        requireState(stateCode), prefix, page);
        return found.stream().map(CityDto::from).toList();
    }

    public CityDto nearest(double lat, double lon) {
        if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
            throw ApiException.badRequest("lat must be -90 to 90 and lon must be -180 to 180");
        }
        return cities.findNearest(lat, lon)
                .map(CityDto::from)
                .orElseThrow(() -> ApiException.notFound("No cities are loaded"));
    }

    /** Returns the code in upper case, or fails with 404 if there is no such state. */
    private String requireState(String stateCode) {
        String code = stateCode.trim().toUpperCase(Locale.ROOT);
        if (!states.existsById(code)) {
            throw ApiException.notFound("No state with code " + code);
        }
        return code;
    }
}
