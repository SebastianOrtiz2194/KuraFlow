import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileNav } from './MobileNav';
import './MainLayout.css';

export const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="layout-container">
      <Sidebar />
      <div className="main-wrapper">
        <Header />
        <main className="content-area">
          <div className="container">
            {children}
          </div>
        </main>
        <MobileNav />
      </div>
    </div>
  );
};
