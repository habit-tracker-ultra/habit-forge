'use client';

import { useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Flame, ArrowLeft } from 'lucide-react';

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
        setMessage('✓ Password reset link sent! Check your email.');
        setEmail('');
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px', position: 'relative', overflow: 'hidden' }}>
      {/* Background Glow */}
      <div style={{ position: 'absolute', top: '-200px', left: '50%', transform: 'translateX(-50%)', width: '600px', height: '400px', background: 'radial-gradient(ellipse, rgba(232,168,58,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={{ width: '100%', maxWidth: '400px' }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: 'linear-gradient(135deg, #e8a83a, #c8901e)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(232,168,58,0.25)' }}>
              <Flame size={22} color='#0a0a0b' strokeWidth={2.5} />
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
            Forgot your password?
          </h2>
          <p style={{ color: 'var(--text-tertiary)', fontSize: '12px', marginBottom: '24px' }}>
            No problem. Enter your email and we'll send you a reset link.
          </p>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '20px' }}>
              <label style={{ color: 'var(--text-secondary)', fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em', display: 'block', marginBottom: '6px' }}>EMAIL ADDRESS</label>
              <input
                type='email'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder='you@example.com'
                required
                style={{ width: '100%', padding: '11px 14px', borderRadius: '10px', fontSize: '13px' }}
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
              {loading ? 'Sending...' : 'Send Reset Link'}
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