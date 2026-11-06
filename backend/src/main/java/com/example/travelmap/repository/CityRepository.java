package com.example.travelmap.repository;

import com.example.travelmap.entity.City;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CityRepository extends JpaRepository<City, Long> {

    /** Every city in one state at or above a population, biggest first. */
    List<City> findByStateCodeAndPopulationGreaterThanEqualOrderByPopulationDesc(String stateCode, int population);

    /** Autocomplete across the whole country. */
    List<City> findByNameStartingWithIgnoreCaseOrderByPopulationDesc(String prefix, Pageable pageable);

    /** Autocomplete inside one state. */
    List<City> findByStateCodeAndNameStartingWithIgnoreCaseOrderByPopulationDesc(
            String stateCode, String prefix, Pageable pageable);

    /**
     * The city closest to a point. Distances this short don't need real spherical maths:
     * scaling longitude by cos(latitude) is accurate enough to pick the nearest town.
     */
    @Query(value = """
            SELECT * FROM cities
            ORDER BY power(lat - :lat, 2) + power((lon - :lon) * cos(radians(:lat)), 2)
            LIMIT 1
            """, nativeQuery = true)
    Optional<City> findNearest(@Param("lat") double lat, @Param("lon") double lon);

    /** The cities a user has marked as visited. */
    @Query("""
            select c from City c
            where c.id in (select v.cityId from VisitedCity v where v.userId = :userId)
            order by c.stateCode, c.name
            """)
    List<City> findVisitedByUser(@Param("userId") Long userId);
}
