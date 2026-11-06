package com.example.travelmap.dto;

import com.example.travelmap.entity.User;

public record UserDto(Long id, String email, String displayName) {

    public static UserDto from(User user) {
        return new UserDto(user.getId(), user.getEmail(), user.getDisplayName());
    }
}
