'use client'
import { useEffect, useRef } from 'react'
import { useIsMobile } from '@/lib/useIsMobile'

export default function FinalCTA() {
  const img1Ref = useRef<HTMLDivElement>(null)
  const img2Ref = useRef<HTMLDivElement>(null)
  const mouse = useRef({ x: 0, y: 0 })
  const lerped = useRef({ x: 0, y: 0 })
  const isMobile = useIsMobile(1100)

  useEffect(() => {
    if (isMobile) return
    let rafId: number
    const section = document.getElementById('rdv')

    const onMouseMove = (e: MouseEvent) => {
      mouse.current.x = e.clientX / window.innerWidth - 0.5
      mouse.current.y = e.clientY / window.innerHeight - 0.5
    }
    window.addEventListener('mousemove', onMouseMove)

    const update = () => {
      rafId = requestAnimationFrame(update)
      lerped.current.x += (mouse.current.x - lerped.current.x) * 0.05
      lerped.current.y += (mouse.current.y - lerped.current.y) * 0.05

      if (!section) return
      const sectionTop = section.offsetTop
      const sy = window.scrollY
      const relative = sy - (sectionTop - 900)
      const progress = Math.max(0, relative)
      const mx = lerped.current.x
      const my = lerped.current.y

      if (img1Ref.current) {
        const y = 180 - progress * 0.15
        const s = 1 + progress * 0.0003
        const r = -6 + progress * 0.004
        img1Ref.current.style.transform = `translateY(${y + my * 20}px) translateX(${mx * 16}px) rotate(${r + mx * 2}deg) scale(${s})`
      }
      if (img2Ref.current) {
        const y = 260 - progress * 0.18
        const s = 1 + progress * 0.00025
        const r = 5 - progress * 0.003
        img2Ref.current.style.transform = `translateY(${y + my * 30}px) translateX(${mx * 24}px) rotate(${r - mx * 2}deg) scale(${s})`
      }
    }

    update()
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      cancelAnimationFrame(rafId)
    }
  }, [isMobile])

  const cardBase: React.CSSProperties = {
    position: 'absolute',
    pointerEvents: 'none',
    willChange: 'transform',
    borderRadius: 20,
    overflow: 'hidden',
    boxShadow: '0 40px 100px rgba(0,0,0,0.45)',
  }

  return (
    <div style={{ background: '#F97316', position: 'relative', overflow: 'visible', minHeight: isMobile ? 'auto' : 400 }} id="rdv">
      <div className="container" style={{ paddingTop: isMobile ? 48 : 80, paddingBottom: isMobile ? 48 : 80, position: 'relative' }}>

        <div style={{ position: 'relative', zIndex: 2, maxWidth: isMobile ? '100%' : 500 }}>
          <p style={{ fontSize: 11, letterSpacing: 4, textTransform: 'uppercase' as const, color: 'rgba(8,8,8,0.5)', marginBottom: 16, fontWeight: 500 }}>Réserver</p>
          <h2 style={{ fontFamily: 'var(--font-unbounded)', fontSize: 'clamp(26px,4vw,52px)', fontWeight: 900, color: '#080808', letterSpacing: -2, lineHeight: 1.05 }}>
            Prends ton RDV.<br />
            <em style={{ fontStyle: 'italic', fontFamily: 'var(--font-gochi)', fontWeight: 400 }}>Rejoins le flow.</em>
          </h2>
        </div>

        {!isMobile && (
          <>
            <div
              ref={img2Ref}
              data-no-reveal
              style={{ ...cardBase, right: '-40px', top: '40px', width: 'clamp(240px, 24vw, 380px)', zIndex: 3, transform: 'translateY(260px) rotate(5deg)' }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/flottan2/BTNIrwpFlu4aFSiF17RWI.jpg" alt="" style={{ display: 'block', width: '100%', height: 'auto' }} />
            </div>

            <div
              ref={img1Ref}
              data-no-reveal
              style={{ ...cardBase, right: '360px', top: '60px', width: 'clamp(300px, 32vw, 500px)', zIndex: 4, transform: 'translateY(180px) rotate(-6deg)' }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/flottan2/nCXvR6Egslx41-5n8LJAW-7982x5321.jpg" alt="" style={{ display: 'block', width: '100%', height: 'auto' }} />
            </div>
          </>
        )}

      </div>
    </div>
  )
}
