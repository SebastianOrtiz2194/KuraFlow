'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { MainLayout } from '@/components/layout/MainLayout';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
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
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/content/languages`, { headers: { ...getAuthHeaders() } })
      .then(r => r.json())
      .then(data => setLanguages(data))
      .catch(() => {});
  }, []);

  const selectedLang = languages.find(l => l.code === selectedLangCode);

  useEffect(() => {
    if (!selectedLang) return;
    setSelectedLevelId(null);
    setModules([]);
    setLessons([]);
    fetch(`${API_BASE}/content/levels?languageId=${selectedLang.id}`, { headers: { ...getAuthHeaders() } })
      .then(r => r.json())
      .then(data => setLevels(data.content || []))
      .catch(() => {});
  }, [selectedLang?.id]);

  useEffect(() => {
    if (!selectedLevelId) return;
    setModules([]);
    setLessons([]);
    setSelectedModuleId(null);
    fetch(`${API_BASE}/content/modules?levelId=${selectedLevelId}`, { headers: { ...getAuthHeaders() } })
      .then(r => r.json())
      .then(data => setModules(data.content || []))
      .catch(() => {});
  }, [selectedLevelId]);

  useEffect(() => {
    if (!selectedModuleId) return;
    setLoading(true);
    setLessons([]);
    fetch(`${API_BASE}/content/lessons?moduleId=${selectedModuleId}`, { headers: { ...getAuthHeaders() } })
      .then(r => r.json())
      .then(data => setLessons(data.content || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [selectedModuleId]);

  const handleModuleClick = (moduleId: string) => {
    setSelectedModuleId(moduleId);
  };

  return (
    <MainLayout>
      <div className="lessons-page">
        <header className="lessons-header">
          <h1>Lessons</h1>
          <div className="language-tabs">
            {languages.map(lang => (
              <button
                key={lang.code}
                className={`lang-tab ${selectedLangCode === lang.code ? 'active' : ''}`}
                onClick={() => setSelectedLangCode(lang.code)}
              >
                {lang.name} ({lang.framework})
              </button>
            ))}
          </div>
        </header>

        {levels.length > 0 && (
          <section className="levels-section">
            <h2>Levels</h2>
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
          </section>
        )}

        {modules.length > 0 && (
          <section className="modules-section">
            <h2>Modules</h2>
            <div className="modules-grid">
              {modules.map(mod => (
                <Card key={mod.id} className={`module-card ${selectedModuleId === mod.id ? 'selected' : ''}`}>
                  <CardContent>
                    <div className="module-type-badge">{mod.type}</div>
                    <h3 className="module-title">{mod.title}</h3>
                    <p className="module-desc">{mod.description}</p>
                    <div className="module-footer">
                      <Button variant="primary" size="sm" onClick={() => handleModuleClick(mod.id)}>
                        View Lessons
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {lessons.length > 0 && (
          <section className="lesson-list-section">
            <h2>Lessons</h2>
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
                    <Link href={`/lesson/${lesson.id}`}><Button variant="outline" size="sm">Start Lesson</Button></Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {loading && <p style={{textAlign:'center', color:'var(--text-secondary)'}}>Loading lessons...</p>}
      </div>
    </MainLayout>
  );
}
