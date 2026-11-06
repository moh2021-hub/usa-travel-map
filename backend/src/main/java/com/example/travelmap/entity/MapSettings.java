package com.example.travelmap.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/** A user's saved look for their map. One row per user. */
@Entity
@Table(name = "map_settings")
public class MapSettings {

    @Id
    @Column(name = "user_id")
    private Long userId;

    @Column(nullable = false)
    private String theme = "interstate";

    @Column(name = "show_labels", nullable = false)
    private boolean showLabels = true;

    protected MapSettings() {
        // required by JPA
    }

    public MapSettings(Long userId) {
        this.userId = userId;
    }

    public Long getUserId() {
        return userId;
    }

    public String getTheme() {
        return theme;
    }

    public void setTheme(String theme) {
        this.theme = theme;
    }

    public boolean isShowLabels() {
        return showLabels;
    }

    public void setShowLabels(boolean showLabels) {
        this.showLabels = showLabels;
    }
}
