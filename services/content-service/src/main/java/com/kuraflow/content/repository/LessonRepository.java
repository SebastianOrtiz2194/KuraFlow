package com.kuraflow.content.repository;

import com.kuraflow.content.entity.Lesson;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface LessonRepository extends JpaRepository<Lesson, UUID> {
    Page<Lesson> findByModuleId(UUID moduleId, Pageable pageable);
}
