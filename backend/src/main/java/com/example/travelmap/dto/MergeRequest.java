package com.example.travelmap.dto;

import jakarta.validation.constraints.Size;

import java.util.List;

/**
 * Places picked while logged out, sent once right after login so they are added to the account.
 * Any list may be left out.
 */
public record MergeRequest(
        @Size(max = 100, message = "Too many states") List<String> states,
        @Size(max = 400, message = "Too many countries") List<String> countries,
        @Size(max = 20000, message = "Too many cities") List<Long> cityIds) {
}
