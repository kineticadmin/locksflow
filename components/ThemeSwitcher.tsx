'use client'
import { useTheme } from '@/lib/ThemeContext'

export default function ThemeSwitcher() {
  const { isDark, toggle } = useTheme()

  return (
    <button
      onClick={toggle}
      title={isDark ? 'Mode clair' : 'Mode sombre'}
      style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '4px 6px',
        opacity: 0.4,
        fontSize: 16,
        lineHeight: 1,
        transition: 'opacity 0.2s',
        flexShrink: 0,
      }}
      onMouseEnter={e => (e.currentTarget.style.opacity = '0.9')}
      onMouseLeave={e => (e.currentTarget.style.opacity = '0.4')}
      aria-label="Changer le thème"
    >
      {isDark ? '☀' : '◐'}
    </button>
  )
}
