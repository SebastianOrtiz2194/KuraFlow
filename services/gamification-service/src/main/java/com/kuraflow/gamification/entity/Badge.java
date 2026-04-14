package com.kuraflow.gamification.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "badges", schema = "gamification_schema")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Badge {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true)
    private String code;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "icon_url")
    private String iconUrl;

    @Column(name = "xp_reward")
    @Builder.Default
    private Integer xpReward = 0;

    @Column(length = 30)
    private String category;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "criteria", nullable = false, columnDefinition = "jsonb")
    private Map<String, Object> criteria;
}
