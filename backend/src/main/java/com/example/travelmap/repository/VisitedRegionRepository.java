package com.example.travelmap.repository;

import com.example.travelmap.entity.VisitedRegion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface VisitedRegionRepository extends JpaRepository<VisitedRegion, Long> {

    @Query("""
            select v.regionCode from VisitedRegion v
            where v.userId = :userId and v.regionType = :type
            order by v.regionCode
            """)
    List<String> findCodes(@Param("userId") Long userId, @Param("type") String type);

    /** Marks a region as visited. Does nothing if it already is, so it is safe to call twice. */
    @Modifying
    @Query(value = """
            INSERT INTO visited_regions (user_id, region_type, region_code)
            VALUES (:userId, :type, :code)
            ON CONFLICT (user_id, region_type, region_code) DO NOTHING
            """, nativeQuery = true)
    void add(@Param("userId") Long userId, @Param("type") String type, @Param("code") String code);

    @Modifying
    @Query("""
            delete from VisitedRegion v
            where v.userId = :userId and v.regionType = :type and v.regionCode = :code
            """)
    void remove(@Param("userId") Long userId, @Param("type") String type, @Param("code") String code);
}
