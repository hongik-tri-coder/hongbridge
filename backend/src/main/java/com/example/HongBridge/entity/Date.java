package com.example.HongBridge.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "date")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@IdClass(DateId.class) // 복합키
public class Date {

    @Id
    @Column(length = 20)
    private String jmCd;   // FK: qualification.JMCD

    @Id
    private Integer year;  // 연도

    @Id
    private Integer period;  // 회차

    // 필기 일정
    private LocalDateTime docRegStart;
    private LocalDateTime docRegEnd;
    private LocalDateTime docVacancyStart;
    private LocalDateTime docVacancyEnd;
    private LocalDateTime docExamStart;
    private LocalDateTime docExamEnd;
    private LocalDateTime docPass;

    // 실기 일정
    private LocalDateTime pracRegStart;
    private LocalDateTime pracRegEnd;
    private LocalDateTime pracVacancyStart;
    private LocalDateTime pracVacancyEnd;
    private LocalDateTime pracExamStart;
    private LocalDateTime pracExamEnd;
    private LocalDateTime pracPass;
}
