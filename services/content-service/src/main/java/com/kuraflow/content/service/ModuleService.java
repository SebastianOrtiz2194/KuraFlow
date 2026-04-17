package com.kuraflow.content.service;

import com.kuraflow.content.dto.ModuleResponse;
import com.kuraflow.content.dto.PagedResponse;
import com.kuraflow.content.entity.Module;
import com.kuraflow.content.exception.ResourceNotFoundException;
import com.kuraflow.content.repository.ModuleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ModuleService {

    private final ModuleRepository moduleRepository;

    @Cacheable(value = "modules", key = "{#levelId, #pageNo, #pageSize}")
    public PagedResponse<ModuleResponse> getModulesByLevel(UUID levelId, int pageNo, int pageSize) {
        Pageable pageable = PageRequest.of(pageNo, pageSize, Sort.by("sortOrder").ascending());
        Page<Module> modulePage = moduleRepository.findByLevelId(levelId, pageable);

        return new PagedResponse<>(
                modulePage.getContent().stream().map(this::mapToResponse).toList(),
                modulePage.getNumber(),
                modulePage.getSize(),
                modulePage.getTotalElements(),
                modulePage.getTotalPages(),
                modulePage.isLast()
        );
    }

    @Cacheable(value = "module", key = "#id")
    public ModuleResponse getModuleById(UUID id) {
        Module module = moduleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Module", "id", id));
        return mapToResponse(module);
    }

    private ModuleResponse mapToResponse(Module module) {
        return new ModuleResponse(
                module.getId(),
                module.getLevel().getId(),
                module.getType(),
                module.getTitle(),
                module.getDescription(),
                module.getSortOrder(),
                module.getIconUrl()
        );
    }
}
