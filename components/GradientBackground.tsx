'use client'
import { useEffect, useRef } from 'react'

export default function GradientBackground() {
  const ref = useRef<HTMLDivElement>(null)
  const mouse = useRef({ x: 0.3, y: 0.5 })
  const lerped = useRef({ x: 0.3, y: 0.5 })

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouse.current.x = e.clientX / window.innerWidth
      mouse.current.y = e.clientY / window.innerHeight
    }
    window.addEventListener('mousemove', onMove)

    let rafId: number
    const animate = () => {
      lerped.current.x += (mouse.current.x - lerped.current.x) * 0.04
      lerped.current.y += (mouse.current.y - lerped.current.y) * 0.04

      const el = ref.current
      if (el) {
        const x = lerped.current.x * 100
        const y = lerped.current.y * 100
        el.style.background = `
          radial-gradient(ellipse 60% 50% at ${x}% ${y}%, rgba(249,115,22,0.10) 0%, transparent 60%),
          radial-gradient(ellipse at ${100 - x * 0.6}% ${100 - y * 0.8}%, #1A0A2E 0%, transparent 55%),
          radial-gradient(ellipse at ${x * 0.4}% ${100 - y * 0.4}%, #0D2818 0%, transparent 50%),
          linear-gradient(135deg, #080808 0%, #120A04 40%, #0A0A14 100%)
        `
      }

      rafId = requestAnimationFrame(animate)
    }
    animate()

    return () => {
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(rafId)
    }
  }, [])

  return (
    <div
      ref={ref}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: -1,
        pointerEvents: 'none',
      }}
    />
  )
}
