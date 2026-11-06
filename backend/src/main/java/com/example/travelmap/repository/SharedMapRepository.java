package com.example.travelmap.repository;

import com.example.travelmap.entity.SharedMap;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface SharedMapRepository extends JpaRepository<SharedMap, String> {

    Optional<SharedMap> findByUserId(Long userId);
}
