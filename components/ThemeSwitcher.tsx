'use client'
import { useTheme } from '@/lib/ThemeContext'
import { useState } from 'react'

export default function ThemeSwitcher() {
  const { isDark, toggle } = useTheme()
  const [hovered, setHovered] = useState(false)

  return (
    <button
      onClick={toggle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      aria-label="Changer le thème"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '8px 14px',
        borderRadius: 100,
        background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
        border: `1px solid ${hovered ? '#F97316' : isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.12)'}`,
        cursor: 'pointer',
        transition: 'background 0.2s, border-color 0.2s',
        flexShrink: 0,
      }}
    >
      {isDark ? (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'rgba(255,255,255,0.85)', flexShrink: 0 }}>
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      ) : (
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'rgba(0,0,0,0.75)', flexShrink: 0 }}>
          <circle cx="12" cy="12" r="5" />
          <line x1="12" y1="1" x2="12" y2="3" />
          <line x1="12" y1="21" x2="12" y2="23" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="1" y1="12" x2="3" y2="12" />
          <line x1="21" y1="12" x2="23" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
      )}
      <span style={{
        fontSize: 11,
        fontFamily: 'var(--font-unbounded, sans-serif)',
        fontWeight: 500,
        color: isDark ? 'rgba(255,255,255,0.85)' : 'rgba(0,0,0,0.75)',
        letterSpacing: 0.3,
        lineHeight: 1,
      }}>
        {isDark ? 'Clair' : 'Sombre'}
      </span>
    </button>
  )
}
