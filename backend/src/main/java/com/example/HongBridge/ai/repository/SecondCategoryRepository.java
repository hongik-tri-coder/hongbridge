package com.example.HongBridge.ai.repository;

import com.example.HongBridge.ai.entity.SecondCategory;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SecondCategoryRepository extends JpaRepository<SecondCategory, Long> {
    List<SecondCategory> findByNameContainingOrFirstCategoryNameContaining(String name, String firstCategoryName);
}
