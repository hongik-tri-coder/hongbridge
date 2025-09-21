package com.example.HongBridge.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Column;
import jakarta.persistence.Table;
import lombok.*;

@Entity
@Table(name = "field")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Field {

    @Id
    @Column(length = 50)
    private String id;   // 분야 ID

    @Column(length = 255)
    private String depth1;  // 직무분야

    @Column(length = 255)
    private String depth2;  // 분류
}
