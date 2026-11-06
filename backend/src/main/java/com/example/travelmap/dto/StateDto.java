package com.example.travelmap.dto;

import com.example.travelmap.entity.State;

public record StateDto(String code, String fips, String name) {

    public static StateDto from(State state) {
        return new StateDto(state.getCode(), state.getFips(), state.getName());
    }
}
