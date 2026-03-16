'use client'
import Link from 'next/link'
import BookingCalendar from './BookingCalendar'
import { useIsMobile } from '@/lib/useIsMobile'
import { useTheme } from '@/lib/ThemeContext'

function IconPin() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F97316" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
      <circle cx="12" cy="9" r="2.5"/>
    </svg>
  )
}

function IconPhone() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F97316" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M6.62 10.79a15.05 15.05 0 006.59 6.59l2.2-2.2a1 1 0 011.01-.24 11.47 11.47 0 003.6.57 1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1c0 1.25.2 2.45.57 3.57a1 1 0 01-.25 1.02l-2.2 2.2z"/>
    </svg>
  )
}

function IconClock() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F97316" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9"/>
      <polyline points="12 7 12 12 15.5 15.5"/>
    </svg>
  )
}

const iconBox = { width: 40, height: 40, background: 'rgba(249,115,22,0.10)', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 } as const

export default function LocationSection() {
  const isMobile = useIsMobile()
  const isTablet = useIsMobile(1024)
  const { bgSection, fg, fgMuted, border, borderMed } = useTheme()
  return (
    <section style={{ background: bgSection }} id="location">
      <div className="container" style={{
        paddingTop: isMobile ? 60 : 120,
        paddingBottom: isMobile ? 60 : 120,
        display: 'grid',
        gridTemplateColumns: isTablet ? '1fr' : '1fr 1.4fr',
        gap: isMobile ? 48 : isTablet ? 56 : 80,
        alignItems: 'start',
      }}>

        <div>
          <div style={{ fontSize: 11, letterSpacing: 4, textTransform: 'uppercase', color: '#F97316', fontWeight: 500, marginBottom: 32, display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ display: 'block', width: 32, height: 1, background: '#F97316' }} />
            Nous trouver
          </div>
          <h2 style={{ fontFamily: 'var(--font-unbounded)', fontSize: 'clamp(24px,3.5vw,48px)', fontWeight: 900, letterSpacing: -1.5, lineHeight: 1.1, marginBottom: 32, color: fg }}>
            On est<br />à{' '}
            <em style={{ fontStyle: 'italic', fontFamily: 'var(--font-gochi)', fontWeight: 400, color: '#F97316' }}>Neuilly.</em>
            <br />T&apos;es le bienvenu.
          </h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 40 }}>
            <a href="https://maps.google.com/?q=Neuilly-sur-Marne,93330" target="_blank" rel="noreferrer" style={{ display: 'flex', alignItems: 'flex-start', gap: 16, textDecoration: 'none' }}>
              <div style={iconBox}><IconPin /></div>
              <div>
                <strong style={{ display: 'block', fontSize: 15, fontWeight: 500, marginBottom: 2, color: fg }}>Neuilly-sur-Marne</strong>
                <small style={{ color: fgMuted, fontSize: 13 }}>93330 — Seine-Saint-Denis · Ouvrir dans Maps</small>
              </div>
            </a>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
              <div style={iconBox}><IconPhone /></div>
              <div>
                <strong style={{ display: 'block', fontSize: 15, fontWeight: 500, marginBottom: 2, color: fg }}>
                  <a href="tel:+33749696141" style={{ color: 'inherit', textDecoration: 'none' }}>07 49 69 61 41</a>
                </strong>
                <small style={{ color: fgMuted, fontSize: 13 }}>Répondons à vos messages</small>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
              <div style={iconBox}><IconClock /></div>
              <div>
                <strong style={{ display: 'block', fontSize: 15, fontWeight: 500, marginBottom: 2, color: fg }}>Sur rendez-vous</strong>
                <small style={{ color: fgMuted, fontSize: 13 }}>Lundi – Samedi</small>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <SocialBtn href="https://instagram.com/lock.flowinspired" label="lock.flowinspired" />
            <SocialBtn href="https://tiktok.com/@locksflow" label="Locks Flow" />
          </div>
        </div>

        <div>
          <div style={{ fontSize: 11, letterSpacing: 4, textTransform: 'uppercase', color: '#F97316', fontWeight: 500, marginBottom: 32, display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ display: 'block', width: 32, height: 1, background: '#F97316' }} />
            Prendre RDV
          </div>
          <BookingCalendar />
        </div>

      </div>
    </section>
  )
}

function SocialBtn({ href, label }: { href: string; label: string }) {
  const { fg, borderMed } = useTheme()
  return (
    <Link href={href} target="_blank" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', border: `1px solid ${borderMed}`, borderRadius: 100, fontSize: 13, color: fg, textDecoration: 'none' }}>
      {label}
    </Link>
  )
}
