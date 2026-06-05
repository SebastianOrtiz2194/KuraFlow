package com.kuraflow.user.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "user_follows", schema = "user_schema")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@IdClass(UserFollowId.class)
public class UserFollow {

    @Id
    @Column(name = "follower_id", nullable = false)
    private UUID followerId;

    @Id
    @Column(name = "followed_id", nullable = false)
    private UUID followedId;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private OffsetDateTime createdAt;
}
