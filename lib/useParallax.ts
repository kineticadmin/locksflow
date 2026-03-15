'use client'
import { useEffect, useRef } from 'react'

export function useParallax(speed = 0.3) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    let rafId: number

    const onScroll = () => {
      rafId = requestAnimationFrame(() => {
        if (!el) return
        const rect = el.getBoundingClientRect()
        const scrolled = window.scrollY
        const offset = (rect.top + scrolled) * speed
        el.style.transform = `translateY(${scrolled * speed - offset * 0}px)`
      })
    }

    // Simpler: translate based on scroll relative to viewport center
    const update = () => {
      const rect = el.getBoundingClientRect()
      const viewportCenter = window.innerHeight / 2
      const elementCenter = rect.top + rect.height / 2
      const distance = elementCenter - viewportCenter
      el.style.transform = `translateY(${distance * speed * -0.15}px)`
    }

    const handleScroll = () => {
      rafId = requestAnimationFrame(update)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    update()

    return () => {
      window.removeEventListener('scroll', handleScroll)
      cancelAnimationFrame(rafId)
    }
  }, [speed])

  return ref
}
