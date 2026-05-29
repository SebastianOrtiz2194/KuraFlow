package com.kuraflow.user.repository;

import com.kuraflow.user.entity.UserFollow;
import com.kuraflow.user.entity.UserFollowId;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface UserFollowRepository extends JpaRepository<UserFollow, UserFollowId> {

    List<UserFollow> findByFollowerId(UUID followerId);

    List<UserFollow> findByFollowedId(UUID followedId);

    long countByFollowerId(UUID followerId);

    long countByFollowedId(UUID followedId);
    
    @Query("SELECT uf.followedId FROM UserFollow uf WHERE uf.followerId = :followerId")
    List<UUID> findFollowedIdsByFollowerId(UUID followerId);

    @Query("SELECT uf.followerId FROM UserFollow uf WHERE uf.followedId = :followedId")
    List<UUID> findFollowerIdsByFollowedId(UUID followedId);
}
