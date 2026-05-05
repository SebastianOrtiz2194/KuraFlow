package com.kuraflow.progress.service;

import com.kuraflow.progress.dto.SaveProgressRequest;
import com.kuraflow.progress.entity.UserProgress;

import java.util.UUID;

public interface ProgressService {
    UserProgress saveLessonProgress(UUID userId, UUID lessonId, SaveProgressRequest request);
    UserProgress getLessonProgress(UUID userId, UUID lessonId);
}
