package com.example.travelmap.controller;

import com.example.travelmap.config.CurrentUser;
import com.example.travelmap.dto.MergeRequest;
import com.example.travelmap.dto.VisitsDto;
import com.example.travelmap.service.VisitService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/**
 * The logged-in user's visited places.
 * PUT marks a place and DELETE unmarks it; both are safe to repeat.
 */
@RestController
@RequestMapping("/api/me/visits")
public class VisitController {

    private final VisitService visitService;

    public VisitController(VisitService visitService) {
        this.visitService = visitService;
    }

    @GetMapping
    public VisitsDto all(@AuthenticationPrincipal Jwt jwt) {
        return visitService.getVisits(CurrentUser.id(jwt));
    }

    @PostMapping("/merge")
    public VisitsDto merge(@AuthenticationPrincipal Jwt jwt, @Valid @RequestBody MergeRequest request) {
        return visitService.merge(CurrentUser.id(jwt), request);
    }

    @PutMapping("/states/{code}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void addState(@AuthenticationPrincipal Jwt jwt, @PathVariable("code") String code) {
        visitService.addState(CurrentUser.id(jwt), code);
    }

    @DeleteMapping("/states/{code}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removeState(@AuthenticationPrincipal Jwt jwt, @PathVariable("code") String code) {
        visitService.removeState(CurrentUser.id(jwt), code);
    }

    @PutMapping("/countries/{code}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void addCountry(@AuthenticationPrincipal Jwt jwt, @PathVariable("code") String code) {
        visitService.addCountry(CurrentUser.id(jwt), code);
    }

    @DeleteMapping("/countries/{code}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removeCountry(@AuthenticationPrincipal Jwt jwt, @PathVariable("code") String code) {
        visitService.removeCountry(CurrentUser.id(jwt), code);
    }

    @PutMapping("/cities/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void addCity(@AuthenticationPrincipal Jwt jwt, @PathVariable("id") Long id) {
        visitService.addCity(CurrentUser.id(jwt), id);
    }

    @DeleteMapping("/cities/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removeCity(@AuthenticationPrincipal Jwt jwt, @PathVariable("id") Long id) {
        visitService.removeCity(CurrentUser.id(jwt), id);
    }
}
