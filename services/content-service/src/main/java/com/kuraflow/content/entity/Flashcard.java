package com.kuraflow.content.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.OffsetDateTime;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "flashcards", schema = "content_schema")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Flashcard {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "deck_id", nullable = false)
    private FlashcardDeck deck;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "front", nullable = false, columnDefinition = "jsonb")
    private Map<String, Object> front;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "back", nullable = false, columnDefinition = "jsonb")
    private Map<String, Object> back;

    @Column(name = "tags")
    @JdbcTypeCode(SqlTypes.ARRAY)
    private String[] tags;

    @Column(name = "sort_order")
    private Integer sortOrder;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;
}
