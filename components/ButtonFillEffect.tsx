'use client'
import { useEffect } from 'react'

export default function ButtonFillEffect() {
  useEffect(() => {
    const setup = () => {
      document.querySelectorAll<HTMLElement>('.btn-fill').forEach(el => {
        if (el.dataset.fillReady) return
        el.dataset.fillReady = '1'

        // Enveloppe le contenu existant dans un span au-dessus du blob
        const wrapper = document.createElement('span')
        wrapper.style.cssText = 'position:relative;z-index:2;display:flex;align-items:center;justify-content:center;width:100%;'
        while (el.firstChild) wrapper.appendChild(el.firstChild)
        el.appendChild(wrapper)

        const blob = document.createElement('span')
        blob.className = 'fill-blob'
        el.insertBefore(blob, el.firstChild)

        const activate = (x: number, y: number, enter: boolean) => {
          const rect = el.getBoundingClientRect()
          const size = Math.max(rect.width, rect.height) * 3.5
          const posX = x - rect.left - size / 2
          const posY = y - rect.top - size / 2

          // Repositionne sans transition d'abord
          blob.style.transition = 'none'
          blob.style.width  = size + 'px'
          blob.style.height = size + 'px'
          blob.style.left   = posX + 'px'
          blob.style.top    = posY + 'px'
          blob.style.transform = 'scale(0)'

          // Force reflow pour que la position soit prise en compte
          void blob.offsetWidth

          // Lance la transition
          if (enter) {
            blob.style.transition = 'transform 0.48s cubic-bezier(0.22, 1, 0.36, 1)'
            blob.style.transform = 'scale(1)'
          } else {
            blob.style.transition = 'transform 0.38s cubic-bezier(0.55, 0, 1, 0.45)'
            blob.style.transform = 'scale(0)'
          }
        }

        el.addEventListener('mouseenter', (e: MouseEvent) => activate(e.clientX, e.clientY, true))
        el.addEventListener('mouseleave', (e: MouseEvent) => activate(e.clientX, e.clientY, false))
      })
    }

    setup()
    const observer = new MutationObserver(setup)
    observer.observe(document.body, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [])

  return null
}
