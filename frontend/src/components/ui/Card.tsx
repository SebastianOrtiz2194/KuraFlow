import React from 'react';
import './Card.css';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'premium' | 'outline' | 'glass';
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, className = '', variant = 'default', onClick }) => {
  const classes = `card card-${variant} ${onClick ? 'card-interactive' : ''} ${className}`;
  return (
    <div className={classes} onClick={onClick}>
      {children}
    </div>
  );
};

export const CardHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`card-header ${className}`}>{children}</div>
);

export const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`card-content ${className}`}>{children}</div>
);

export const CardFooter: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`card-footer ${className}`}>{children}</div>
);
