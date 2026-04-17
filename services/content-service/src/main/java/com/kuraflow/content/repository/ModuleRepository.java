package com.kuraflow.content.repository;

import com.kuraflow.content.entity.Module;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface ModuleRepository extends JpaRepository<Module, UUID> {
    Page<Module> findByLevelId(UUID levelId, Pageable pageable);
}
