package com.example.travelmap.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/** A state or country a user has marked as visited. */
@Entity
@Table(name = "visited_regions")
public class VisitedRegion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    /** "STATE" or "COUNTRY" - see {@link RegionType}. */
    @Column(name = "region_type", nullable = false)
    private String regionType;

    /** "MI" for a state, ISO numeric code such as "840" for a country. */
    @Column(name = "region_code", nullable = false)
    private String regionCode;

    protected VisitedRegion() {
        // required by JPA
    }

    public Long getId() {
        return id;
    }

    public Long getUserId() {
        return userId;
    }

    public String getRegionType() {
        return regionType;
    }

    public String getRegionCode() {
        return regionCode;
    }
}
