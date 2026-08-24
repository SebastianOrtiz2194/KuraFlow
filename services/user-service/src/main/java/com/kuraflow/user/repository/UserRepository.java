package com.kuraflow.user.repository;

import com.kuraflow.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    List<User> findByDisplayNameContainingIgnoreCase(String displayName);

    @Query("SELECT u.id FROM User u WHERE u.timezone IN :timezones")
    List<UUID> findIdsByTimezoneIn(@Param("timezones") Collection<String> timezones);
}
