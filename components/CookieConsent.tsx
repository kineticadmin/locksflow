'use client'
import { useEffect, useState } from 'react'
import { useTheme } from '@/lib/ThemeContext'

export type ConsentState = {
  analytics: boolean
  marketing: boolean
  decided: boolean
}

const STORAGE_KEY = 'lf_cookie_consent'

export function getConsent(): ConsentState | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

function saveConsent(state: ConsentState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  window.dispatchEvent(new CustomEvent('consent-update', { detail: state }))
}

export default function CookieConsent() {
  const [visible, setVisible] = useState(false)
  const [panel, setPanel] = useState(false)
  const [analytics, setAnalytics] = useState(false)
  const [marketing, setMarketing] = useState(false)
  const { isDark, fg, fgMuted, bgCard, border, borderStr } = useTheme()

  useEffect(() => {
    const existing = getConsent()
    if (!existing?.decided) setVisible(true)
  }, [])

  function acceptAll() {
    saveConsent({ analytics: true, marketing: true, decided: true })
    setVisible(false)
    setPanel(false)
  }

  function rejectAll() {
    saveConsent({ analytics: false, marketing: false, decided: true })
    setVisible(false)
    setPanel(false)
  }

  function saveCustom() {
    saveConsent({ analytics, marketing, decided: true })
    setVisible(false)
    setPanel(false)
  }

  if (!visible) return null

  const overlay: React.CSSProperties = {
    position: 'fixed',
    inset: 0,
    zIndex: 9000,
    background: 'rgba(0,0,0,0.45)',
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
    padding: '0 0 24px',
  }

  const box: React.CSSProperties = {
    background: isDark ? '#111' : '#FAF7F2',
    border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.12)'}`,
    borderRadius: 16,
    padding: '28px 32px',
    maxWidth: 600,
    width: 'calc(100% - 32px)',
    boxShadow: '0 24px 80px rgba(0,0,0,0.4)',
  }

  const btnBase: React.CSSProperties = {
    borderRadius: 100,
    padding: '10px 22px',
    fontSize: 12,
    fontFamily: 'var(--font-unbounded)',
    fontWeight: 700,
    cursor: 'pointer',
    transition: '0.2s',
    letterSpacing: 0.5,
    whiteSpace: 'nowrap',
    border: 'none',
  }

  const toggle = (val: boolean, set: (v: boolean) => void) => (
    <button
      type="button"
      onClick={() => set(!val)}
      style={{
        width: 44,
        height: 24,
        borderRadius: 100,
        background: val ? '#F97316' : (isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.12)'),
        border: 'none',
        cursor: 'pointer',
        position: 'relative',
        transition: 'background 0.2s',
        flexShrink: 0,
      }}
    >
      <span style={{
        position: 'absolute',
        top: 3,
        left: val ? 23 : 3,
        width: 18,
        height: 18,
        borderRadius: '50%',
        background: '#fff',
        transition: 'left 0.2s',
        boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
      }} />
    </button>
  )

  return (
    <div style={overlay} role="dialog" aria-modal="true" aria-label="Gestion des cookies">
      <div style={box}>

        {!panel ? (
          <>
            <p style={{ fontFamily: 'var(--font-unbounded)', fontSize: 13, fontWeight: 700, color: fg, marginBottom: 10 }}>
              Ce site utilise des cookies
            </p>
            <p style={{ fontSize: 12, color: fgMuted, lineHeight: 1.7, marginBottom: 24, fontFamily: 'var(--font-dm, sans-serif)' }}>
              Nous utilisons des cookies pour mesurer l&apos;audience et vous proposer des contenus adaptes. Vous pouvez accepter, refuser ou personnaliser vos choix a tout moment.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
              <button style={{ ...btnBase, background: '#F97316', color: '#080808' }} onClick={acceptAll}>
                Tout accepter
              </button>
              <button
                style={{ ...btnBase, background: 'transparent', color: fg, border: `1px solid ${borderStr}` }}
                onClick={rejectAll}
              >
                Tout refuser
              </button>
              <button
                style={{ ...btnBase, background: 'transparent', color: fgMuted, border: `1px solid ${border}`, fontWeight: 500 }}
                onClick={() => setPanel(true)}
              >
                Personnaliser
              </button>
            </div>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => setPanel(false)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: fgMuted, fontSize: 12, fontFamily: 'var(--font-unbounded)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 6, padding: 0 }}
            >
              ← Retour
            </button>
            <p style={{ fontFamily: 'var(--font-unbounded)', fontSize: 13, fontWeight: 700, color: fg, marginBottom: 20 }}>
              Personnaliser les cookies
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 28 }}>

              {/* Strictement necessaires — toujours actifs */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, padding: '16px', background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)', borderRadius: 10, border: `1px solid ${border}` }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-unbounded)', color: fg, marginBottom: 4 }}>Strictement necessaires</div>
                  <div style={{ fontSize: 11, color: fgMuted, lineHeight: 1.6, fontFamily: 'var(--font-dm, sans-serif)' }}>Fonctionnement du site (session, preferences de theme). Ne peuvent pas etre refuses.</div>
                </div>
                <div style={{ paddingTop: 2 }}>
                  <div style={{ width: 44, height: 24, borderRadius: 100, background: '#F97316', position: 'relative', flexShrink: 0, opacity: 0.5 }}>
                    <span style={{ position: 'absolute', top: 3, left: 23, width: 18, height: 18, borderRadius: '50%', background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.3)' }} />
                  </div>
                </div>
              </div>

              {/* Analytics */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, padding: '16px', background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)', borderRadius: 10, border: `1px solid ${border}` }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-unbounded)', color: fg, marginBottom: 4 }}>Mesure d&apos;audience</div>
                  <div style={{ fontSize: 11, color: fgMuted, lineHeight: 1.6, fontFamily: 'var(--font-dm, sans-serif)' }}>Statistiques de visite anonymisees (pages vues, provenance). Nous aide a ameliorer le site.</div>
                </div>
                <div style={{ paddingTop: 2 }}>{toggle(analytics, setAnalytics)}</div>
              </div>

              {/* Marketing */}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, padding: '16px', background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)', borderRadius: 10, border: `1px solid ${border}` }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-unbounded)', color: fg, marginBottom: 4 }}>Publicite et reseaux sociaux</div>
                  <div style={{ fontSize: 11, color: fgMuted, lineHeight: 1.6, fontFamily: 'var(--font-dm, sans-serif)' }}>Pixels de retargeting (Meta, Google Ads). Utilises pour des campagnes publicitaires ciblees.</div>
                </div>
                <div style={{ paddingTop: 2 }}>{toggle(marketing, setMarketing)}</div>
              </div>

            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              <button style={{ ...btnBase, background: '#F97316', color: '#080808' }} onClick={saveCustom}>
                Enregistrer mes choix
              </button>
              <button
                style={{ ...btnBase, background: 'transparent', color: fgMuted, border: `1px solid ${border}`, fontWeight: 500 }}
                onClick={rejectAll}
              >
                Tout refuser
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  )
}
