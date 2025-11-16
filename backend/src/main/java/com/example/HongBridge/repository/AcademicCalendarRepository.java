package com.example.HongBridge.repository;

import com.example.HongBridge.entity.AcademicCalendar;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AcademicCalendarRepository extends JpaRepository<AcademicCalendar, Long> {

    List<AcademicCalendar> findByTitleContaining(String title);
}
