package com.example.travelmap.repository;

import com.example.travelmap.entity.VisitedCity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface VisitedCityRepository extends JpaRepository<VisitedCity, Long> {

    /** Marks a city as visited. Does nothing if it already is, so it is safe to call twice. */
    @Modifying
    @Query(value = """
            INSERT INTO visited_cities (user_id, city_id)
            VALUES (:userId, :cityId)
            ON CONFLICT (user_id, city_id) DO NOTHING
            """, nativeQuery = true)
    void add(@Param("userId") Long userId, @Param("cityId") Long cityId);

    @Modifying
    @Query("delete from VisitedCity v where v.userId = :userId and v.cityId = :cityId")
    void remove(@Param("userId") Long userId, @Param("cityId") Long cityId);
}
