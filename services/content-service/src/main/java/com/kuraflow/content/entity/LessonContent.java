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
@Table(name = "lesson_content", schema = "content_schema")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LessonContent {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lesson_id", nullable = false)
    private Lesson lesson;

    @Column(name = "content_type", nullable = false)
    private String contentType;

    @Column(name = "sort_order", nullable = false)
    private Integer sortOrder;

    @Column
    private String title;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "body", nullable = false, columnDefinition = "jsonb")
    private Map<String, Object> body;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;
}
