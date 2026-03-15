'use client'
import { useEffect, useRef } from 'react'
import { useIsMobile } from '@/lib/useIsMobile'

interface CardConfig {
  src: string
  width: number
  right: number
  top: number
  initialRotate: number
  scrollSpeed: number
  scrollRotate: number
  scrollScale: number
  zIndex: number
  mouseDepth: number
}

const cards: CardConfig[] = [
  {
    src: '/images/flottan2/Uj-hLv0GjTAvIBmP9qoW8.jpg',
    width: 420,
    right: 60,
    top: 100,
    initialRotate: 4,
    scrollSpeed: 0.55,
    scrollRotate: 6,
    scrollScale: 0.15,
    zIndex: 30,
    mouseDepth: 28,
  },
  {
    src: '/images/flottan2/LCKIygGM-ThKM-epZmCSS.jpg',
    width: 360,
    right: 520,
    top: 280,
    initialRotate: -5,
    scrollSpeed: 0.75,
    scrollRotate: -8,
    scrollScale: 0.2,
    zIndex: 28,
    mouseDepth: 18,
  },
]

export default function FloatingCards() {
  const refs = useRef<(HTMLDivElement | null)[]>([])
  const triggerRef = useRef<number | null>(null)
  const mouse = useRef({ x: 0, y: 0 })
  const lerped = useRef({ x: 0, y: 0 })
  const isMobile = useIsMobile()

  useEffect(() => {
    if (isMobile) return

    let rafId: number

    const getTrigger = () => {
      const section = document.getElementById('services')
      if (!section) return 0
      return section.offsetTop - section.offsetHeight * 0.4
    }

    const onMouseMove = (e: MouseEvent) => {
      mouse.current.x = (e.clientX / window.innerWidth - 0.5)
      mouse.current.y = (e.clientY / window.innerHeight - 0.5)
    }
    window.addEventListener('mousemove', onMouseMove)

    const update = () => {
      rafId = requestAnimationFrame(update)

      lerped.current.x += (mouse.current.x - lerped.current.x) * 0.06
      lerped.current.y += (mouse.current.y - lerped.current.y) * 0.06

      const sy = window.scrollY

      if (triggerRef.current === null) {
        triggerRef.current = getTrigger()
      }
      const trigger = triggerRef.current

      cards.forEach((card, i) => {
        const el = refs.current[i]
        if (!el) return

        const syClamp = Math.min(sy, trigger)
        let translateY = sy * card.scrollSpeed
        let translateX = 0

        if (sy >= trigger) {
          const past = sy - trigger
          const progress = Math.min(past / 300, 1)
          const dir = i === 0 ? 1 : -1
          const distance = i === 0 ? 600 : window.innerWidth
          translateX = dir * progress * distance
          translateY = trigger * card.scrollSpeed
        }

        const rotate = card.initialRotate + (syClamp / 1000) * card.scrollRotate
        const scale = 1 + (syClamp / 1000) * card.scrollScale
        const mx = lerped.current.x * card.mouseDepth
        const my = lerped.current.y * card.mouseDepth

        el.style.transform = `translateY(${translateY + my}px) translateX(${translateX + mx}px) rotate(${rotate}deg) scale(${scale})`
        el.style.opacity = '1'
      })
    }

    const onResize = () => { triggerRef.current = getTrigger() }
    window.addEventListener('resize', onResize)
    update()

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('resize', onResize)
      cancelAnimationFrame(rafId)
    }
  }, [isMobile])

  if (isMobile) return null

  return (
    <>
      {cards.map((card, i) => (
        <div
          key={i}
          ref={el => { refs.current[i] = el }}
          style={{
            position: 'absolute',
            top: card.top,
            right: card.right,
            width: card.width,
            zIndex: card.zIndex,
            pointerEvents: 'none',
            willChange: 'transform, opacity',
            transform: `rotate(${card.initialRotate}deg)`,
            borderRadius: 16,
            overflow: 'hidden',
            boxShadow: '0 30px 80px rgba(0,0,0,0.6)',
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={card.src} alt="" style={{ display: 'block', width: '100%', height: 'auto' }} />
        </div>
      ))}
    </>
  )
}
