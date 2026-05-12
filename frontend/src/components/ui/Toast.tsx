"use client";

import React, { useState, createContext, useContext } from 'react';
import Image from 'next/image';
import './Toast.css';

interface ToastMessage {
  id: string;
  title: string;
  description: string;
  iconUrl?: string;
  xpReward?: number;
  type: 'badge-earned' | 'info' | 'success';
}

interface ToastContextType {
  showToast: (message: Omit<ToastMessage, 'id'>) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (message: Omit<ToastMessage, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { ...message, id }]);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast ${toast.type}`}>
            <div className="toast-icon">
              {toast.iconUrl ? (
                <Image src={toast.iconUrl} alt="Badge" width={32} height={32} />
              ) : (
                <span style={{ fontSize: '1.5rem' }}>🏆</span>
              )}
            </div>
            <div className="toast-content">
              <div className="toast-title">{toast.title}</div>
              <div className="toast-description">{toast.description}</div>
              {toast.xpReward && (
                <span className="toast-xp">+{toast.xpReward} XP Reward</span>
              )}
            </div>
            <button 
              className="toast-close" 
              onClick={() => removeToast(toast.id)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer',
                opacity: 0.5,
                padding: '0 0.5rem'
              }}
            >
              &times;
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
