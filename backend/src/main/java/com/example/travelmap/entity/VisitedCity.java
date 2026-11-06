package com.example.travelmap.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/** A city a user has marked as visited. */
@Entity
@Table(name = "visited_cities")
public class VisitedCity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "city_id", nullable = false)
    private Long cityId;

    protected VisitedCity() {
        // required by JPA
    }

    public Long getId() {
        return id;
    }

    public Long getUserId() {
        return userId;
    }

    public Long getCityId() {
        return cityId;
    }
}
