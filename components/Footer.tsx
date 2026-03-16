'use client'
import { useTheme } from '@/lib/ThemeContext'

export default function Footer() {
  const { bg, fg, fgMuted, border } = useTheme()
  return (
    <footer style={{ background: bg, borderTop: `1px solid ${border}` }}>
      <div className="container" style={{ paddingTop: 48, paddingBottom: 48, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' as const, gap: 24 }}>
      <div>
        <div style={{ fontFamily: 'var(--font-unbounded)', fontSize: 20, fontWeight: 900, letterSpacing: -0.5, color: fg }}>
          locks<span style={{ color: '#F97316' }}>.</span>flow
        </div>
        <div style={{ fontSize: 13, color: fgMuted, fontStyle: 'italic', fontFamily: 'var(--font-gochi)' }}>Tes locks, ton flow.</div>
      </div>
      <div style={{ fontSize: 12, color: fgMuted }}>© 2025 Locks Flow · Salon de Locks · Neuilly-sur-Marne</div>
      </div>
    </footer>
  )
}
