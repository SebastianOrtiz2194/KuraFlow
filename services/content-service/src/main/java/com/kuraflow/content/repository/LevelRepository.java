package com.kuraflow.content.repository;

import com.kuraflow.content.entity.Level;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface LevelRepository extends JpaRepository<Level, UUID> {
    Page<Level> findByLanguageId(UUID languageId, Pageable pageable);
}
