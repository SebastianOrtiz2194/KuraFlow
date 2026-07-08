'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { getAuthHeaders } from '@/lib/api';
import './lessons.css';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

interface Language {
  id: string;
  code: string;
  name: string;
  framework: string;
}

interface Level {
  id: string;
  code: string;
  name: string;
  sortOrder: number;
}

interface Module {
  id: string;
  type: string;
  title: string;
  description: string;
  sortOrder: number;
}

interface Lesson {
  id: string;
  title: string;
  description: string;
  sortOrder: number;
  estimatedMinutes: number;
  xpReward: number;
}

export default function LessonsPage() {
  const [languages, setLanguages] = useState<Language[]>([]);
  const [selectedLangCode, setSelectedLangCode] = useState('ja');
  const [levels, setLevels] = useState<Level[]>([]);
  const [selectedLevelId, setSelectedLevelId] = useState<string | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  
  const [loadingLanguages, setLoadingLanguages] = useState(true);
  const [loadingLevels, setLoadingLevels] = useState(false);
  const [loadingModules, setLoadingModules] = useState(false);
  const [loadingLessons, setLoadingLessons] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch languages on mount
  useEffect(() => {
    setLoadingLanguages(true);
    setError(null);
    fetch(`${API_BASE}/content/languages`, { headers: { ...getAuthHeaders() } })
      .then(r => {
        if (!r.ok) throw new Error(`Failed to load languages (${r.status})`);
        return r.json();
      })
      .then(data => {
        setLanguages(data);
        if (data && data.length > 0) {
          const hasJa = data.some((l: any) => l.code === 'ja');
          if (!hasJa) {
            setSelectedLangCode(data[0].code);
          }
        }
      })
      .catch(err => setError(err.message || 'Failed to load languages'))
      .finally(() => setLoadingLanguages(false));
  }, []);

  const selectedLang = languages.find(l => l.code === selectedLangCode);

  // Fetch levels when selected language changes
  useEffect(() => {
    if (!selectedLang) return;
    setLoadingLevels(true);
    setSelectedLevelId(null);
    setModules([]);
    setLessons([]);
    setError(null);
    fetch(`${API_BASE}/content/levels?languageId=${selectedLang.id}`, { headers: { ...getAuthHeaders() } })
      .then(r => {
        if (!r.ok) throw new Error(`Failed to load levels (${r.status})`);
        return r.json();
      })
      .then(data => {
        const fetchedLevels = data.content || [];
        setLevels(fetchedLevels);
        if (fetchedLevels.length > 0) {
          setSelectedLevelId(fetchedLevels[0].id);
        }
      })
      .catch(err => setError(err.message || 'Failed to load levels'))
      .finally(() => setLoadingLevels(false));
  }, [selectedLang?.id]);

  // Fetch modules when selected level changes
  useEffect(() => {
    if (!selectedLevelId) return;
    setLoadingModules(true);
    setModules([]);
    setLessons([]);
    setSelectedModuleId(null);
    setError(null);
    fetch(`${API_BASE}/content/modules?levelId=${selectedLevelId}`, { headers: { ...getAuthHeaders() } })
      .then(r => {
        if (!r.ok) throw new Error(`Failed to load modules (${r.status})`);
        return r.json();
      })
      .then(data => {
        const fetchedModules = data.content || [];
        setModules(fetchedModules);
        if (fetchedModules.length > 0) {
          setSelectedModuleId(fetchedModules[0].id);
        }
      })
      .catch(err => setError(err.message || 'Failed to load modules'))
      .finally(() => setLoadingModules(false));
  }, [selectedLevelId]);

  // Fetch lessons when selected module changes
  useEffect(() => {
    if (!selectedModuleId) return;
    setLoadingLessons(true);
    setLessons([]);
    setError(null);
    fetch(`${API_BASE}/content/lessons?moduleId=${selectedModuleId}`, { headers: { ...getAuthHeaders() } })
      .then(r => {
        if (!r.ok) throw new Error(`Failed to load lessons (${r.status})`);
        return r.json();
      })
      .then(data => setLessons(data.content || []))
      .catch(err => setError(err.message || 'Failed to load lessons'))
      .finally(() => setLoadingLessons(false));
  }, [selectedModuleId]);

  const handleModuleClick = (moduleId: string) => {
    setSelectedModuleId(moduleId);
  };

  return (
    <MainLayout>
      <div className="lessons-page">
        {error && (
          <div className="lessons-error">
            <p>{error}</p>
          </div>
        )}

        <header className="lessons-header">
          <h1>Lessons</h1>
          <div className="language-tabs">
            {loadingLanguages ? (
              <p style={{ color: 'var(--text-secondary)' }}>Loading languages...</p>
            ) : languages.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)' }}>No languages available. Try logging in.</p>
            ) : (
              languages.map(lang => (
                <button
                  key={lang.code}
                  className={`lang-tab ${selectedLangCode === lang.code ? 'active' : ''}`}
                  onClick={() => setSelectedLangCode(lang.code)}
                >
                  {lang.name} ({lang.framework})
                </button>
              ))
            )}
          </div>
        </header>

        {/* Levels Section */}
        <section className="levels-section">
          <h2>Levels</h2>
          {loadingLevels ? (
            <div className="levels-grid">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="skeleton-item skeleton-level-card" />
              ))}
            </div>
          ) : levels.length > 0 ? (
            <div className="levels-grid">
              {levels.map(level => (
                <button
                  key={level.id}
                  className={`level-card ${selectedLevelId === level.id ? 'active' : ''}`}
                  onClick={() => setSelectedLevelId(level.id)}
                >
                  <span className="level-code">{level.code}</span>
                  <span className="level-name">{level.name}</span>
                </button>
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--text-secondary)' }}>No levels found for this language.</p>
          )}
        </section>

        {/* Modules Section */}
        {(loadingModules || modules.length > 0) && (
          <section className="modules-section">
            <h2>Modules</h2>
            {loadingModules ? (
              <div className="modules-grid">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="skeleton-item skeleton-module-card" />
                ))}
              </div>
            ) : (
              <div className="modules-grid">
                {modules.map(mod => (
                  <Card 
                    key={mod.id} 
                    className={`module-card ${selectedModuleId === mod.id ? 'selected' : ''}`}
                    onClick={() => handleModuleClick(mod.id)}
                  >
                    <CardContent>
                      <div className="module-type-badge">{mod.type}</div>
                      <h3 className="module-title">{mod.title}</h3>
                      <p className="module-desc">{mod.description}</p>
                      <div className="module-footer">
                        <Button 
                          variant={selectedModuleId === mod.id ? 'primary' : 'outline'} 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleModuleClick(mod.id);
                          }}
                        >
                          {selectedModuleId === mod.id ? 'Viewing Lessons' : 'View Lessons'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>
        )}

        {/* Lessons Section */}
        {(loadingLessons || lessons.length > 0) && (
          <section className="lesson-list-section">
            <h2>Lessons</h2>
            {loadingLessons ? (
              <div className="lesson-grid">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="skeleton-item skeleton-lesson-card" />
                ))}
              </div>
            ) : (
              <div className="lesson-grid">
                {lessons.map(lesson => (
                  <Card key={lesson.id} className="lesson-card">
                    <CardContent>
                      <h3 className="lesson-title">{lesson.title}</h3>
                      <p className="lesson-desc">{lesson.description}</p>
                      <div className="lesson-meta">
                        <span>{lesson.estimatedMinutes} min</span>
                        <span>{lesson.xpReward} XP</span>
                      </div>
                      <Link href={`/lesson/${lesson.id}`}>
                        <Button variant="outline" size="sm" style={{ width: '100%' }}>
                          Start Lesson
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>
        )}

        {!loadingModules && modules.length === 0 && selectedLevelId && (
          <p style={{ color: 'var(--text-secondary)', textAlign: 'center' }}>No modules found for this level.</p>
        )}
      </div>
    </MainLayout>
  );
}
