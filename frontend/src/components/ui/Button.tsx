import React from 'react';
import './Button.css';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  disabled,
  ...props
}) => {
  const classes = `btn btn-${variant} btn-${size} ${className} ${isLoading ? 'is-loading' : ''}`;

  return (
    <button className={classes} disabled={disabled || isLoading} {...props}>
      {isLoading && <span className="btn-spinner" />}
      {!isLoading && leftIcon && <span className="btn-icon btn-icon-left">{leftIcon}</span>}
      <span className="btn-content">{children}</span>
      {!isLoading && rightIcon && <span className="btn-icon btn-icon-right">{rightIcon}</span>}
    </button>
  );
};
