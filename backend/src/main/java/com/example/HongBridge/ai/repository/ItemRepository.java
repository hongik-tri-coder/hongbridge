package com.example.HongBridge.ai.repository;

import com.example.HongBridge.ai.entity.Item;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.EntityGraph;

import java.util.List;

public interface ItemRepository extends JpaRepository<Item, Long> {

    // SecondCategory를 즉시 로딩하도록 EntityGraph 설정
    @EntityGraph(attributePaths = {"secondCategory"})
    List<Item> findBySecondCategoryIdIn(List<Long> secondCategoryIds);
}
