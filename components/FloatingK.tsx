'use client'
import { useEffect, useRef } from 'react'

export default function FloatingK() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    let rafId: number

    const update = () => {
      // Scroll plus lentement que le site (0.4x au lieu de 1x)
      el.style.transform = `translateY(${window.scrollY * 0.7}px)`
    }

    const onScroll = () => { rafId = requestAnimationFrame(update) }
    window.addEventListener('scroll', onScroll, { passive: true })
    update()

    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(rafId)
    }
  }, [])

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
