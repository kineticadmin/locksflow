'use client'
import { useEffect } from 'react'

export default function RevealOnScroll() {
  useEffect(() => {
    const done = new WeakSet<Element>()

    function prepare(el: HTMLElement, delay: number) {
      if (done.has(el)) return
      done.add(el)
      el.style.opacity = '0'
      el.style.transform = 'translateY(40px)'
      el.style.transition = `opacity 0.85s cubic-bezier(0.22,1,0.36,1) ${delay}ms, transform 0.85s cubic-bezier(0.22,1,0.36,1) ${delay}ms`
    }

    const io = new IntersectionObserver(entries => {
      entries.forEach(({ isIntersecting, target }) => {
        if (!isIntersecting) return
        const el = target as HTMLElement
        el.style.opacity = '1'
        el.style.transform = 'translateY(0)'
        io.unobserve(el)
        // Supprime la transition après l'animation pour ne pas interférer avec le parallax
        el.addEventListener('transitionend', () => {
          el.style.transition = ''
        }, { once: true })
      })
    }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' })

    function setup() {
      document.querySelectorAll<HTMLElement>('.container').forEach(container => {
        Array.from(container.children).forEach((child, i) => {
          const el = child as HTMLElement
          // Ne pas toucher aux éléments qui ont déjà un parallax ou transform JS
          if (el.dataset.noReveal) return
          prepare(el, i * 100)
          io.observe(el)

          // Stagger des cartes dans les grilles
          const computed = window.getComputedStyle(el)
          if (computed.display === 'grid') {
            Array.from(el.children).forEach((grand, j) => {
              const g = grand as HTMLElement
              if (g.dataset.noReveal) return
              prepare(g, j * 120)
              io.observe(g)
            })
          }
        })
      })
    }

    const t = setTimeout(setup, 150)
    return () => {
      clearTimeout(t)
      io.disconnect()
    }
  }, [])

  return null
}
