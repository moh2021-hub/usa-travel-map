package com.example.travelmap.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/** A US city or town. Read-only reference data loaded from the seed file. */
@Entity
@Table(name = "cities")
public class City {

    @Id
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(name = "state_code", nullable = false)
    private String stateCode;

    @Column(nullable = false)
    private double lat;

    @Column(nullable = false)
    private double lon;

    @Column(nullable = false)
    private int population;

    protected City() {
        // required by JPA
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getStateCode() {
        return stateCode;
    }

    public double getLat() {
        return lat;
    }

    public double getLon() {
        return lon;
    }

    public int getPopulation() {
        return population;
    }
}
