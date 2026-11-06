package com.example.travelmap.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/** One of the 50 states or DC. Read-only reference data loaded from the seed file. */
@Entity
@Table(name = "states")
public class State {

    /** Postal abbreviation, e.g. "MI". */
    @Id
    private String code;

    /** Census FIPS code, e.g. "26". This is the id used in the map file. */
    @Column(nullable = false)
    private String fips;

    @Column(nullable = false)
    private String name;

    protected State() {
        // required by JPA
    }

    public String getCode() {
        return code;
    }

    public String getFips() {
        return fips;
    }

    public String getName() {
        return name;
    }
}
