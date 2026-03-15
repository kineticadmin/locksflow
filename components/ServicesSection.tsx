'use client'
import { useEffect, useRef, useState } from 'react'
import { useIsMobile } from '@/lib/useIsMobile'

interface Service { id: string; name: string; description: string; price: string; unit: string }

function selectService(name: string) {
  window.dispatchEvent(new CustomEvent('select-service', { detail: { service: name } }))
  document.getElementById('location')?.scrollIntoView({ behavior: 'smooth' })
}

export default function ServicesSection() {
  const gridRef = useRef<HTMLDivElement>(null)
  const isMobile = useIsMobile()
  const isTablet = useIsMobile(1024)
  const [services, setServices] = useState<Service[]>([])

  useEffect(() => {
    fetch('/api/services')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setServices(data) })
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (isMobile) return
    let raf: number
    const onScroll = () => {
      raf = requestAnimationFrame(() => {
        if (!gridRef.current) return
        const rect = gridRef.current.getBoundingClientRect()
        const center = rect.top + rect.height / 2 - window.innerHeight / 2
        gridRef.current.style.transform = `translateY(${center * -0.15}px)`
      })
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => { window.removeEventListener('scroll', onScroll); cancelAnimationFrame(raf) }
  }, [isMobile])

  return (
    <section style={{ background: 'transparent', overflow: 'hidden' }} id="services">
      <div className="container" style={{ paddingTop: isMobile ? 60 : 120, paddingBottom: isMobile ? 80 : 160 }}>
        <div style={{ fontSize: 11, letterSpacing: 4, textTransform: 'uppercase' as const, color: '#F97316', fontWeight: 500, marginBottom: 32, display: 'flex', alignItems: 'center', gap: 16 }}>
          <span style={{ display: 'block', width: 32, height: 1, background: '#F97316' }} />
          Ce qu&apos;on fait
        </div>
        <h2 style={{ fontFamily: 'var(--font-unbounded)', fontSize: 'clamp(32px,5vw,68px)', fontWeight: 900, letterSpacing: -2, lineHeight: 1, marginBottom: isMobile ? 40 : 80, color: '#F2EDE5' }}>
          Des mains<br />qui{' '}
          <em style={{ fontStyle: 'italic', fontFamily: 'var(--font-gochi)', color: '#F97316', fontWeight: 400 }}>savent.</em>
        </h2>

        <div
          ref={gridRef}
          data-no-reveal
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
            gap: isMobile ? 16 : 20,
            willChange: isMobile ? 'auto' : 'transform',
            paddingTop: (isMobile || isTablet) ? 0 : 60,
          }}
        >
          {services.map((s, i) => (
            <ServiceCard key={s.id} {...s} num={String(i + 1).padStart(2, '0')} offset={!isMobile && !isTablet && i % 2 === 1} />
          ))}
        </div>
      </div>
    </section>
  )
}

function ServiceCard({ num, name, description, price, unit, offset }: { num: string; name: string; description: string; price: string; unit: string; offset: boolean }) {
  const base = offset ? -60 : 0
  return (
    <div
      onClick={() => selectService(name)}
      style={{
        background: '#0d0d0d',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 24,
        padding: 'clamp(24px, 4vw, 48px)',
        position: 'relative',
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'background 0.3s, border-color 0.3s, transform 0.3s',
        transform: `translateY(${base}px)`,
      }}
      onMouseEnter={e => {
        const el = e.currentTarget as HTMLElement
        el.style.background = '#141414'
        el.style.borderColor = 'rgba(249,115,22,0.3)'
        el.style.transform = `translateY(${base - 4}px)`
      }}
      onMouseLeave={e => {
        const el = e.currentTarget as HTMLElement
        el.style.background = '#0d0d0d'
        el.style.borderColor = 'rgba(255,255,255,0.07)'
        el.style.transform = `translateY(${base}px)`
      }}
    >
      <div style={{ fontFamily: 'var(--font-unbounded)', fontSize: 11, fontWeight: 700, letterSpacing: 3, color: '#F97316', opacity: 0.5, marginBottom: 20 }}>{num}</div>
      <div style={{ fontFamily: 'var(--font-unbounded)', fontSize: 'clamp(16px, 3vw, 22px)', fontWeight: 700, marginBottom: 12, lineHeight: 1.2, color: '#F2EDE5' }}>{name}</div>
      <p style={{ fontSize: 13, color: 'rgba(242,237,229,0.5)', lineHeight: 1.7, marginBottom: 28, fontFamily: 'var(--font-unbounded)' }}>{description}</p>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontFamily: 'var(--font-unbounded)', fontSize: 'clamp(20px, 3vw, 28px)', fontWeight: 900, color: '#F97316' }}>
          {price}{unit && <span style={{ fontSize: 13, fontWeight: 400, color: '#888', fontFamily: 'var(--font-unbounded)' }}> {unit}</span>}
        </div>
        <div style={{ fontSize: 11, fontFamily: 'var(--font-unbounded)', color: 'rgba(242,237,229,0.3)', letterSpacing: 1 }}>
          Reserver →
        </div>
      </div>
    </div>
  )
}
