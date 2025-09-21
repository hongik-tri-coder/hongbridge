package com.example.HongBridge.repository;

import com.example.HongBridge.entity.Field;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface FieldRepository extends JpaRepository<Field, String> {
    List<Field> findByDepth1ContainingOrDepth2Containing(String depth1, String depth2);
}
