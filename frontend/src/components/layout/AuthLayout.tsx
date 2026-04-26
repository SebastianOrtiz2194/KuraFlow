import React from 'react';
import Link from 'next/link';
import './AuthLayout.css';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => {
  return (
    <div className="auth-layout-container">
      <div className="auth-sidebar">
        <div className="auth-sidebar-pattern" />
        <div className="auth-sidebar-content">
          <h1 className="auth-sidebar-title">Master Languages Faster with KuraFlow</h1>
          <p className="auth-sidebar-subtitle">
            Experience a smarter way to learn languages with our adaptive Spaced Repetition System and gamified learning engine.
          </p>
        </div>
      </div>
      
      <div className="auth-main">
        <div className="auth-form-container">
          <Link href="/" className="auth-logo" style={{ textDecoration: 'none' }}>
            🏔️ <span>KuraFlow</span>
          </Link>
          
          <div className="auth-form-header">
            <h2 className="auth-form-title">{title}</h2>
            <p className="auth-form-subtitle">{subtitle}</p>
          </div>
          
          {children}
        </div>
      </div>
    </div>
  );
};
