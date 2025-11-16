package com.example.HongBridge.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Getter @Setter
@NoArgsConstructor
@Table(name = "academic_calendar")
public class AcademicCalendar {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Integer context_Year;   // 연도

    @Column(nullable = false)
    private String raw_period;      // 기간 ("03.01 ~ 03.07")

    @Column(nullable = false)
    private String type;           // 일정 타입 ("수강신청", "등록", "학기개시")

    @Column(nullable = false, length = 500)
    private String title;          // 일정 제목 ("2025학년도 1학기 수강신청")
}
