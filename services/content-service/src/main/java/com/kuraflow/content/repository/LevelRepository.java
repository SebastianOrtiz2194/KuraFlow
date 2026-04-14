package com.kuraflow.content.repository;

import com.kuraflow.content.entity.Level;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface LevelRepository extends JpaRepository<Level, UUID> {
    List<Level> findByLanguageIdOrderBySortOrderAsc(UUID languageId);
}
