package com.example.HongBridge.repository;

import com.example.HongBridge.entity.Schedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ScheduleRepository extends JpaRepository<Schedule, Long> {
    // Member의 studentId 기준으로 일정 조회
    List<Schedule> findByUserStudentId(String studentId);
}
