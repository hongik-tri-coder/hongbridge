package com.example.HongBridge.repository;

import com.example.HongBridge.entity.Date;
import com.example.HongBridge.entity.DateId;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface DateRepository extends JpaRepository<Date, DateId> {
    List<Date> findByJmCd(String jmCd);
    List<Date> findByYear(Integer year);
    List<Date> findByJmCdAndYear(String jmCd, Integer year);

    // 최신 시험일정 1개 조회
    Optional<Date> findTopByJmCdOrderByYearDescPeriodDesc(String jmCd);
}
