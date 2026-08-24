package com.kuraflow.content.controller;

import com.kuraflow.content.dto.LanguageResponse;
import com.kuraflow.content.service.LanguageService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class LanguageControllerTest {

    @Mock
    private LanguageService languageService;

    @InjectMocks
    private LanguageController languageController;

    @Test
    @DisplayName("getAllLanguages: Returns all available languages")
    void shouldReturnAllLanguages() {
        LanguageResponse en = new LanguageResponse(UUID.randomUUID(), "en", "English", "CEFR", true);
        LanguageResponse ja = new LanguageResponse(UUID.randomUUID(), "ja", "Japanese", "JLPT", true);

        when(languageService.getAllLanguages()).thenReturn(List.of(en, ja));

        ResponseEntity<List<LanguageResponse>> response = languageController.getAllLanguages();

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).hasSize(2);
    }

    @Test
    @DisplayName("getLanguageById: Returns language by ID")
    void shouldReturnLanguageById() {
        UUID id = UUID.randomUUID();
        LanguageResponse en = new LanguageResponse(id, "en", "English", "CEFR", true);

        when(languageService.getLanguageById(id)).thenReturn(en);

        ResponseEntity<LanguageResponse> response = languageController.getLanguageById(id);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody().name()).isEqualTo("English");
    }
}
