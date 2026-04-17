package com.kuraflow.content.controller;

import com.kuraflow.content.BaseIntegrationTest;
import com.kuraflow.content.dto.LanguageResponse;
import com.kuraflow.content.entity.Language;
import com.kuraflow.content.repository.LanguageRepository;
import com.kuraflow.content.repository.LevelRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

public class LanguageControllerIntegrationTest extends BaseIntegrationTest {

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private LevelRepository levelRepository;

    @Autowired
    private LanguageRepository languageRepository;

    @BeforeEach
    void setUp() {
        levelRepository.deleteAll();
        languageRepository.deleteAll();
        
        Language en = Language.builder().code("en").name("English").framework("CEFR").isActive(true).build();
        Language ja = Language.builder().code("ja").name("Japanese").framework("JLPT").isActive(true).build();
        languageRepository.saveAll(List.of(en, ja));
    }

    @Test
    void shouldReturnAllLanguages() {
        ResponseEntity<LanguageResponse[]> response = restTemplate.getForEntity("/api/content/languages", LanguageResponse[].class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).hasSize(2);
    }
}
