package com.kuraflow.content.repository;

import com.kuraflow.content.entity.Module;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ModuleRepository extends JpaRepository<Module, UUID> {
    List<Module> findByLevelIdOrderBySortOrderAsc(UUID levelId);
}
