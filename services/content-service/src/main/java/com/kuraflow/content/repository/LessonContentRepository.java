package com.kuraflow.content.repository;

import com.kuraflow.content.entity.LessonContent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface LessonContentRepository extends JpaRepository<LessonContent, UUID> {
    List<LessonContent> findByLessonIdOrderBySortOrderAsc(UUID lessonId);
}
