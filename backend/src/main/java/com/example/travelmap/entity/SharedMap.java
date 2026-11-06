package com.example.travelmap.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;

/** A public link to one user's map. The slug is the random part of the URL. */
@Entity
@Table(name = "shared_maps")
public class SharedMap {

    @Id
    private String slug;

    @Column(name = "user_id", nullable = false, unique = true)
    private Long userId;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt = Instant.now();

    protected SharedMap() {
        // required by JPA
    }

    public SharedMap(String slug, Long userId) {
        this.slug = slug;
        this.userId = userId;
    }

    public String getSlug() {
        return slug;
    }

    public Long getUserId() {
        return userId;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
