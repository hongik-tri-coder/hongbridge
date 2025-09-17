package com.example.HongBridge.entity;

import jakarta.persistence.*;
import lombok.*;

import java.util.List;
import java.util.ArrayList;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(
        name = "SecondCategory",
        uniqueConstraints = @UniqueConstraint(columnNames = {"name", "first_category_name"})
)
public class SecondCategory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(name = "first_category_name", nullable = false)
    private String firstCategoryName;

    @OneToMany(mappedBy = "secondCategory", cascade = CascadeType.ALL)
    private List<Item> items = new ArrayList<>();
}