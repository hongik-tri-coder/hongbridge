package com.example.HongBridge.repository;

import com.example.HongBridge.entity.Qualification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface QualificationRepository extends JpaRepository<Qualification, Long> {
    Optional<Qualification> findByJmCd(String jmCd);
    List<Qualification> findByNameContaining(String keyword);
    List<Qualification> findByField_Id(String fieldId);
}
