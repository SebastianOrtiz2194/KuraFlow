'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    
    // Mock API call
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 800);
  };

  if (isSubmitted) {
    return (
      <AuthLayout
        title="Check Your Email"
        subtitle="We've sent password reset instructions to your email."
      >
        <div style={{ textAlign: 'center', margin: '2rem 0' }}>
          <span style={{ fontSize: '3rem' }}>📧</span>
        </div>
        <Button variant="primary" style={{ width: '100%', marginTop: '1rem' }} onClick={() => setIsSubmitted(false)}>
          Back to Reset Password
        </Button>
        <div className="auth-form-footer">
          <Link href="/login" className="auth-link">Return to login</Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout
      title="Reset Password"
      subtitle="Enter your email address and we'll send you instructions to reset your password."
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        <Input
          label="Email Address"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <Button type="submit" variant="primary" size="lg" disabled={isLoading} style={{ marginTop: '0.5rem' }}>
          {isLoading ? 'Sending...' : 'Send Reset Link'}
        </Button>
      </form>

      <div className="auth-form-footer">
        Remember your password? <Link href="/login" className="auth-link">Sign in</Link>
      </div>
    </AuthLayout>
  );
}
