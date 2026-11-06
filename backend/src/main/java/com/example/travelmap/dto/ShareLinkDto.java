package com.example.travelmap.dto;

/** The random part of a share URL. The frontend builds the full link as /share/{slug}. */
public record ShareLinkDto(String slug) {
}
