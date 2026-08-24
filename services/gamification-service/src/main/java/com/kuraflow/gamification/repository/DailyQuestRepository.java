package com.kuraflow.gamification.repository;

import com.kuraflow.gamification.entity.DailyQuest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface DailyQuestRepository extends JpaRepository<DailyQuest, UUID> {
    List<DailyQuest> findByUserIdAndQuestDate(UUID userId, LocalDate questDate);

    Optional<DailyQuest> findByUserIdAndId(UUID userId, UUID id);
}
