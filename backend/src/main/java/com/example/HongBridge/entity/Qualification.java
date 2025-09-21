package com.example.HongBridge.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "qualification")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Qualification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;  // 자격증 PK

    @Column(nullable = false, length = 255)
    private String name;  // 자격증 이름

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fieldId")
    private Field field;  // FK: field.id

    @Column(columnDefinition = "TEXT")
    private String course;  // 과정 설명

    @Column(length = 20, unique = true)
    private String jmCd;  // JMCD 코드
}
