package com.example.travelmap.repository;

import com.example.travelmap.entity.State;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StateRepository extends JpaRepository<State, String> {

    List<State> findAllByOrderByNameAsc();
}
