'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function TestPage() {
  const [status, setStatus] = useState('Testing...');

  useEffect(() => {
    const test = async () => {
      try {
        const { data, error } = await supabase.from('profiles').select('count');
        if (error) {
          setStatus(`❌ Error: ${error.message}`);
        } else {
          setStatus('✅ Supabase Connected Successfully!');
        }
      } catch (err) {
        setStatus(`❌ Exception: ${err}`);
      }
    };
    test();
  }, []);

  return (
    <div style={{ padding: '40px', textAlign: 'center', color: 'white', background: '#0a0a0b', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div>
        <h1 style={{ fontSize: '24px', marginBottom: '20px' }}>Supabase Connection Test</h1>
        <p style={{ fontSize: '18px' }}>{status}</p>
        <p style={{ marginTop: '40px', color: '#888', fontSize: '14px' }}>
          Your Supabase URL: <br />
          {process.env.NEXT_PUBLIC_SUPABASE_URL}
        </p>
      </div>
    </div>
  );
}