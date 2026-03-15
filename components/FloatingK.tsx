'use client'
import { useEffect, useRef } from 'react'
import { useIsMobile } from '@/lib/useIsMobile'

export default function FloatingK() {
  const ref = useRef<HTMLDivElement>(null)
  const isMobile = useIsMobile()

  useEffect(() => {
    if (isMobile) return
    const el = ref.current
    if (!el) return
    let rafId: number

    const update = () => {
      el.style.transform = `translateY(${window.scrollY * 0.7}px)`
    }

    const onScroll = () => { rafId = requestAnimationFrame(update) }
    window.addEventListener('scroll', onScroll, { passive: true })
    update()

    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(rafId)
    }
  }, [isMobile])

  if (isMobile) return null

  return (
    <div
      ref={ref}
      style={{
        position: 'absolute',
        top: 0,
        right: -400,
        zIndex: 10,
        pointerEvents: 'none',
        willChange: 'transform',
        writingMode: 'vertical-lr',
        textOrientation: 'mixed',
      }}
    >
      <span style={{
        fontFamily: 'var(--font-gochi)',
        fontSize: 1140,
        color: '#F97316',
        opacity: 0.06,
        letterSpacing: 20,
        lineHeight: 1,
        userSelect: 'none',
        whiteSpace: 'nowrap',
      }}>
        locksflow
      </span>
    </div>
  )
}
