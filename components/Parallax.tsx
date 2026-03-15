'use client'
import { useEffect, useRef, CSSProperties, ReactNode, ElementType } from 'react'

interface ParallaxProps {
  children: ReactNode
  speed?: number
  style?: CSSProperties
  className?: string
  as?: ElementType
}

export default function Parallax({ children, speed = 0.1, style, className, as: Tag = 'div' }: ParallaxProps) {
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    let rafId: number

    const update = () => {
      if (!el) return
      const rect = el.getBoundingClientRect()
      const center = rect.top + rect.height / 2 - window.innerHeight / 2
      el.style.transform = `translateY(${center * speed * -0.12}px)`
    }

    const onScroll = () => { rafId = requestAnimationFrame(update) }

    window.addEventListener('scroll', onScroll, { passive: true })
    update()

    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(rafId)
    }
  }, [speed])

  return (
    // @ts-expect-error dynamic tag
    <Tag ref={ref} style={{ willChange: 'transform', ...style }} className={className}>
      {children}
    </Tag>
  )
}
