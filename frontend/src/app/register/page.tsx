'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthLayout } from '@/components/layout/AuthLayout';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!name || !email || !password) {
      setError('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    
    // Mock register logic
    setTimeout(() => {
      document.cookie = 'accessToken=mock_jwt_token; path=/; max-age=86400';
      router.push('/dashboard');
    }, 800);
  };

  return (
    <AuthLayout
      title="Create an Account"
      subtitle="Start your language learning journey today."
    >
      <form className="auth-form" onSubmit={handleSubmit}>
        <Input
          label="Full Name"
          type="text"
          placeholder="Sebastian Ortiz"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <Input
          label="Email Address"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        
        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && <div style={{ color: 'var(--danger-color)', fontSize: '0.875rem', textAlign: 'center' }}>{error}</div>}

        <Button type="submit" variant="primary" size="lg" disabled={isLoading} style={{ marginTop: '0.5rem' }}>
          {isLoading ? 'Creating account...' : 'Create Account'}
        </Button>
      </form>

      <div className="auth-form-footer">
        Already have an account? <Link href="/login" className="auth-link">Sign in</Link>
      </div>
    </AuthLayout>
  );
}
