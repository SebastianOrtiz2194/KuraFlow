package com.kuraflow.content.repository;

import com.kuraflow.content.entity.Lesson;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface LessonRepository extends JpaRepository<Lesson, UUID> {
    List<Lesson> findByModuleIdOrderBySortOrderAsc(UUID moduleId);
}
