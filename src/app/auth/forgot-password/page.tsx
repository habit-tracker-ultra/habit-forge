'use client';

import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });

      if (resetError) {
        setError(resetError.message);
      } else {
        setMessage('Password reset link sent to your email! Check your inbox.');
        setEmail('');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: 'var(--text-primary)', margin: '0 0 8px 0' }}>
            Forgot Password?
          </h1>
          <p style={{ color: 'var(--text-secondary)', margin: '0', fontSize: '14px' }}>
            Enter your email to receive a password reset link
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Email Input */}
          <div>
            <label style={{ display: 'block', color: 'var(--text-primary)', fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              required
              style={{
                width: '100%',
                padding: '12px 14px',
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-default)',
                borderRadius: '10px',
                color: 'var(--text-primary)',
                fontSize: '14px',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Error Message */}
          {error && (
            <div style={{ padding: '12px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444', borderRadius: '8px', color: '#ef4444', fontSize: '13px' }}>
              {error}
            </div>
          )}

          {/* Success Message */}
          {message && (
            <div style={{ padding: '12px', background: 'rgba(74, 222, 128, 0.1)', border: '1px solid #4ade80', borderRadius: '8px', color: '#4ade80', fontSize: '13px' }}>
              {message}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '12px',
              background: loading ? 'var(--gold-dark)' : 'linear-gradient(135deg, var(--gold), var(--gold-dark))',
              color: '#0a0a0b',
              border: 'none',
              borderRadius: '10px',
              fontWeight: '700',
              fontSize: '14px',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        {/* Footer Links */}
        <div style={{ marginTop: '24px', textAlign: 'center', display: 'flex', gap: '12px', justifyContent: 'center', fontSize: '13px' }}>
          <Link href="/auth/login" style={{ color: 'var(--gold)', textDecoration: 'none', fontWeight: '600' }}>
            Back to Login
          </Link>
          <span style={{ color: 'var(--text-tertiary)' }}>•</span>
          <Link href="/auth/signup" style={{ color: 'var(--gold)', textDecoration: 'none', fontWeight: '600' }}>
            Create Account
          </Link>
        </div>
      </div>
    </div>
  );
}