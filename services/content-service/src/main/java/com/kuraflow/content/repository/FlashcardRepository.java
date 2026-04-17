package com.kuraflow.content.repository;

import com.kuraflow.content.entity.Flashcard;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface FlashcardRepository extends JpaRepository<Flashcard, UUID> {
    Page<Flashcard> findByDeckId(UUID deckId, Pageable pageable);

    @Query(value = "SELECT * FROM flashcards f WHERE :tag = ANY(f.tags)", 
           countQuery = "SELECT count(*) FROM flashcards f WHERE :tag = ANY(f.tags)",
           nativeQuery = true)
    Page<Flashcard> findByTag(String tag, Pageable pageable);
}
