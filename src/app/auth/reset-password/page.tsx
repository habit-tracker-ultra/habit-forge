'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { ArrowLeft } from 'lucide-react';

export default function ResetPassword() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isValidSession, setIsValidSession] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setIsValidSession(true);
      } else {
        setError('Invalid or expired reset link. Please request a new one.');
      }
      setCheckingSession(false);
    };
    checkSession();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (password !== confirmPassword) {
      setError('Passwords do not match!');
      return;
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters long!');
      return;
    }

    setLoading(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) {
        setError(updateError.message);
      } else {
        setMessage('✓ Password updated! Redirecting to login...');
        setTimeout(() => {
          router.push('/auth/login');
        }, 2000);
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>Loading...</div>
      </div>
    );
  }

  if (!isValidSession && error) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div style={{ textAlign: 'center', maxWidth: '400px' }}>
          <h1 style={{ color: '#ef4444', marginBottom: '12px', fontSize: '20px' }}>Invalid Reset Link</h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', fontSize: '13px' }}>This link has expired. Please request a new one.</p>
          <Link href='/auth/forgot-password' style={{ color: 'var(--gold)', textDecoration: 'none', fontWeight: '600', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <ArrowLeft size={12} /> Request New Link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', position: 'relative', overflow: 'hidden' }}>
      {/* Background Glow */}
      <div style={{ position: 'absolute', top: '-200px', left: '50%', transform: 'translateX(-50%)', width: '600px', height: '400px', background: 'radial-gradient(ellipse, rgba(232,168,58,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: '400px' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: 'linear-gradient(135deg, #e8a83a, #c8901e)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(232,168,58,0.25)', overflow: 'hidden' }}>
              <img src='/logo.png' alt='Habit Forge' style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ color: 'var(--text-primary)', fontWeight: 900, fontSize: '20px', letterSpacing: '-0.03em' }}>HABIT FORGE</div>
              <div style={{ color: 'var(--text-tertiary)', fontSize: '10px', letterSpacing: '0.1em', fontWeight: 600 }}>PREMIUM</div>
            </div>
          </div>
        </div>

        {/* Card */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: '20px', padding: '32px', boxShadow: '0 24px 64px rgba(0,0,0,0.3)' }}>
          <h2 style={{ color: 'var(--text-primary)', fontWeight: 800, fontSize: '20px', letterSpacing: '-0.02em', marginBottom: '6px' }}>
            Reset Password
          </h2>
          <p style={{ color: 'var(--text-tertiary)', fontSize: '12px', marginBottom: '24px' }}>
            Create a new strong password
          </p>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '14px' }}>
              <label style={{ color: 'var(--text-secondary)', fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em', display: 'block', marginBottom: '6px' }}>NEW PASSWORD</label>
              <input
                type='password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder='Min 8 characters'
                required
                style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', fontSize: '13px', background: 'var(--bg-secondary)', border: '1px solid var(--border-default)', color: 'var(--text-primary)', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ color: 'var(--text-secondary)', fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em', display: 'block', marginBottom: '6px' }}>CONFIRM PASSWORD</label>
              <input
                type='password'
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder='Re-enter password'
                required
                style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', fontSize: '13px', background: 'var(--bg-secondary)', border: '1px solid var(--border-default)', color: 'var(--text-primary)', boxSizing: 'border-box' }}
              />
            </div>

            {error && (
              <div style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: '10px', padding: '10px 14px', marginBottom: '16px', color: '#ef4444', fontSize: '12px' }}>
                {error}
              </div>
            )}

            {message && (
              <div style={{ background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)', borderRadius: '10px', padding: '10px 14px', marginBottom: '16px', color: '#4ade80', fontSize: '12px' }}>
                {message}
              </div>
            )}

            <button
              type='submit'
              disabled={loading}
              className='hf-btn-gold'
              style={{ width: '100%', padding: '12px', fontSize: '14px' }}
            >
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </form>

          <div style={{ borderTop: '1px solid var(--border-subtle)', marginTop: '24px', paddingTop: '20px', textAlign: 'center' }}>
            <Link href='/auth/login' style={{ color: 'var(--gold)', fontSize: '12px', fontWeight: 700, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <ArrowLeft size={12} /> Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}