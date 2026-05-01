'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, BarChart3, BookOpen, Clock, Settings, LogOut, Home } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) {
        const saved = localStorage.getItem('sidebar-collapsed');
        setIsCollapsed(saved === 'true');
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    localStorage.setItem('sidebar-collapsed', String(newState));
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/auth/login');
  };

  const navItems = [
    { href: '/dashboard', icon: Home, label: 'Dashboard', active: pathname === '/dashboard' },
    { href: '/dashboard/notebooks', icon: BookOpen, label: 'Notebooks', active: pathname.includes('notebooks') },
    { href: '/dashboard/time', icon: Clock, label: 'Time Manager', active: pathname.includes('time') },
    { href: '/dashboard/insights', icon: BarChart3, label: 'Insights', active: pathname.includes('insights') },
    { href: '/dashboard/settings', icon: Settings, label: 'Settings', active: pathname.includes('settings') },
  ];

  if (isMobile) return null;

  return (
    <div style={{ width: isCollapsed ? 'var(--sidebar-collapsed)' : 'var(--sidebar-width)', background: 'var(--bg-secondary)', borderRight: '1px solid var(--border-subtle)', height: '100vh', display: 'flex', flexDirection: 'column', position: 'fixed', left: 0, top: 0, zIndex: 40, transition: 'all 0.3s ease', overflowY: 'auto' }}>
      {/* Logo Section */}
      <div style={{ padding: '20px 16px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href='/dashboard' style={{ display: 'flex', alignItems: 'center', gap: isCollapsed ? 0 : '12px', textDecoration: 'none', minWidth: 0 }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, #e8a83a, #c8901e)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
            <img src='/logo.png' alt='Habit Forge' style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          {!isCollapsed && (
            <div style={{ minWidth: 0 }}>
              <div style={{ color: 'var(--text-primary)', fontWeight: 900, fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                HABIT FORGE
              </div>
              <div style={{ color: 'var(--text-tertiary)', fontSize: '9px', fontWeight: 700, letterSpacing: '0.1em', whiteSpace: 'nowrap' }}>
                PREMIUM
              </div>
            </div>
          )}
        </Link>
        {!isCollapsed && (
          <button onClick={toggleCollapse} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: '4px' }}>
            <X size={18} />
          </button>
        )}
      </div>

      {/* Navigation Items */}
      <nav style={{ flex: 1, padding: '16px 8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 12px',
              borderRadius: '10px',
              textDecoration: 'none',
              color: item.active ? 'var(--gold)' : 'var(--text-secondary)',
              background: item.active ? 'rgba(232,168,58,0.1)' : 'transparent',
              borderLeft: item.active ? '3px solid var(--gold)' : '3px solid transparent',
              transition: 'all 0.2s ease',
              cursor: 'pointer',
            }}
            onMouseEnter={(e) => {
              if (!item.active) {
                (e.currentTarget as HTMLElement).style.background = 'var(--bg-card)';
                (e.currentTarget as HTMLElement).style.color = 'var(--text-primary)';
              }
            }}
            onMouseLeave={(e) => {
              if (!item.active) {
                (e.currentTarget as HTMLElement).style.background = 'transparent';
                (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)';
              }
            }}
          >
            <item.icon size={20} strokeWidth={1.5} style={{ flexShrink: 0 }} />
            {!isCollapsed && (
              <span style={{ fontSize: '13px', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {item.label}
              </span>
            )}
          </Link>
        ))}
      </nav>

      {/* Bottom Section */}
      <div style={{ padding: '16px 8px', borderTop: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <button
          onClick={handleLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '12px 12px',
            borderRadius: '10px',
            background: 'transparent',
            border: 'none',
            color: 'var(--text-secondary)',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            whiteSpace: 'nowrap',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLElement).style.background = 'var(--bg-card)';
            (e.currentTarget as HTMLElement).style.color = '#ef4444';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLElement).style.background = 'transparent';
            (e.currentTarget as HTMLElement).style.color = 'var(--text-secondary)';
          }}
        >
          <LogOut size={20} strokeWidth={1.5} style={{ flexShrink: 0 }} />
          {!isCollapsed && <span>Logout</span>}
        </button>
      </div>

      {/* Collapse Button (when collapsed) */}
      {isCollapsed && (
        <div style={{ padding: '16px 8px', borderTop: '1px solid var(--border-subtle)' }}>
          <button onClick={toggleCollapse} style={{ width: '100%', padding: '8px', background: 'var(--bg-card)', border: '1px solid var(--border-default)', borderRadius: '8px', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Menu size={18} />
          </button>
        </div>
      )}
    </div>
  );
}