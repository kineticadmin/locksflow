'use client'
import { useIsMobile } from '@/lib/useIsMobile'
import { useTheme } from '@/lib/ThemeContext'

export default function ManifesteSection() {
  const isMobile = useIsMobile()
  const { fg, fgVeryDim } = useTheme()
  return (
    <section style={{ background: 'transparent', position: 'relative', overflow: 'hidden' }}>
      <div className="container" style={{ paddingTop: isMobile ? 60 : 120, paddingBottom: isMobile ? 60 : 120, textAlign: 'center' }}>
        <div style={{ fontFamily: 'var(--font-unbounded)', fontSize: 'clamp(26px,5vw,72px)', fontWeight: 900, letterSpacing: -2, lineHeight: 1.05, position: 'relative', maxWidth: 900, margin: '0 auto 40px', color: fg }}>
          Le flow c&apos;est pas<br />une coiffure.<br />
          C&apos;est{' '}
          <em style={{ fontStyle: 'italic', fontFamily: 'var(--font-gochi)', fontWeight: 400, color: '#F97316' }}>un état d&apos;esprit</em>
          <br />qui finit par pousser<br />sur ta tête.
        </div>
        <p style={{ fontSize: isMobile ? 14 : 16, color: fgVeryDim, fontWeight: 300, maxWidth: 480, margin: '0 auto', lineHeight: 1.8 }}>
          Locks Flow. Neuilly-sur-Marne. Pour ceux qui assument.
        </p>
      </div>
    </section>
  )
}
