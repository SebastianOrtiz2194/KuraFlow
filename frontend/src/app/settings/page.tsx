'use client';

import React from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/Button';
import './settings.css';

export default function SettingsPage() {
  return (
    <MainLayout>
      <div className="settings-page">
        <header className="settings-header">
          <h1>Settings</h1>
        </header>
        <div className="settings-section">
          <div className="setting-item">
            <div>
              <h3>Daily XP Goal</h3>
              <p>50 XP per day</p>
            </div>
            <Button variant="outline" size="sm">Edit</Button>
          </div>
          <div className="setting-item">
            <div>
              <h3>Notifications</h3>
              <p>Streak reminders enabled</p>
            </div>
            <Button variant="outline" size="sm">Configure</Button>
          </div>
          <div className="setting-item">
            <div>
              <h3>Learning Language</h3>
              <p>Japanese (JLPT)</p>
            </div>
            <Button variant="outline" size="sm">Change</Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
