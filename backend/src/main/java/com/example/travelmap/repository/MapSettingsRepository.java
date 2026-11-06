package com.example.travelmap.repository;

import com.example.travelmap.entity.MapSettings;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MapSettingsRepository extends JpaRepository<MapSettings, Long> {
}
