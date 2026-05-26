'use client';

export default function CheckLogoPage() {
  return (
    <div style={{ padding: '40px', background: 'var(--bg-primary)', minHeight: '100vh', color: 'var(--text-primary)' }}>
      <h1>Logo Check Page</h1>
      
      <div style={{ marginTop: '40px', padding: '20px', background: 'var(--bg-card)', borderRadius: '10px' }}>
        <h2>Your Logo Should Appear Below:</h2>
        <div style={{ marginTop: '20px', padding: '20px', background: 'var(--bg-secondary)', borderRadius: '10px' }}>
          <img 
            src='/logo.png' 
            alt='Logo' 
            style={{ width: '200px', height: '200px', objectFit: 'cover', borderRadius: '10px' }}
          />
        </div>
      </div>

      <div style={{ marginTop: '40px', padding: '20px', background: 'var(--bg-card)', borderRadius: '10px' }}>
        <h2>Image Details:</h2>
        <p>File: /logo.png</p>
        <p>Size: 200x200px</p>
        <p>If image doesn't show above, the file is missing or has issues</p>
      </div>
    </div>
  );
}