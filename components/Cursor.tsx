'use client'
import { useEffect, useRef } from 'react'

export default function Cursor() {
  const cursorRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const cursor = cursorRef.current
    if (!cursor) return

    const move = (e: MouseEvent) => {
      cursor.style.left = e.clientX + 'px'
      cursor.style.top = e.clientY + 'px'
    }

    const grow = () => cursor.classList.add('big')
    const shrink = () => cursor.classList.remove('big')

    document.addEventListener('mousemove', move)
    document.querySelectorAll('a, .service-card').forEach(el => {
      el.addEventListener('mouseenter', grow)
      el.addEventListener('mouseleave', shrink)
    })

    return () => document.removeEventListener('mousemove', move)
  }, [])

  return (
    <div
      ref={cursorRef}
      className="cursor fixed w-3 h-3 bg-orange rounded-full pointer-events-none z-[10000] -translate-x-1/2 -translate-y-1/2"
      style={{ transition: 'transform 0.1s, width 0.3s, height 0.3s' }}
    />
  )
}
