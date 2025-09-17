package com.example.HongBridge.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(
        name = "Item",
        uniqueConstraints = @UniqueConstraint(columnNames = {"name", "second_category_id"})
)
public class Item {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "second_category_id",
            foreignKey = @ForeignKey(name = "FK_ITEM_SECOND_CATEGORY")
    )
    private SecondCategory secondCategory;
}