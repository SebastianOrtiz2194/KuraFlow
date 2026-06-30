package com.kuraflow.user.repository;

import com.kuraflow.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);

    @org.springframework.data.jpa.repository.Query("SELECT u.id FROM User u WHERE u.timezone IN :timezones")
    java.util.List<UUID> findIdsByTimezoneIn(@org.springframework.data.repository.query.Param("timezones") java.util.Collection<String> timezones);
}
