package com.example.travelmap.controller;

import com.example.travelmap.dto.CityDto;
import com.example.travelmap.dto.StateDto;
import com.example.travelmap.service.CityService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/** Public, read-only reference data: states and cities. No login needed. */
@RestController
public class PlaceController {

    private final CityService cityService;

    public PlaceController(CityService cityService) {
        this.cityService = cityService;
    }

    @GetMapping("/api/states")
    public List<StateDto> states() {
        return cityService.listStates();
    }

    @GetMapping("/api/states/{code}/cities")
    public List<CityDto> citiesInState(
            @PathVariable("code") String code,
            @RequestParam(name = "minPopulation", defaultValue = "0") int minPopulation) {
        return cityService.citiesInState(code, minPopulation);
    }

    @GetMapping("/api/cities/search")
    public List<CityDto> search(
            @RequestParam(name = "q") String q,
            @RequestParam(name = "state", required = false) String state,
            @RequestParam(name = "limit", defaultValue = "10") int limit) {
        return cityService.search(q, state, limit);
    }

    @GetMapping("/api/cities/nearest")
    public CityDto nearest(
            @RequestParam(name = "lat") double lat,
            @RequestParam(name = "lon") double lon) {
        return cityService.nearest(lat, lon);
    }
}
