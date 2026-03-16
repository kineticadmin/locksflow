'use client'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import { useIsMobile } from '@/lib/useIsMobile'
import ThemeSwitcher from './ThemeSwitcher'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const isMobile = useIsMobile()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollToBooking = (e: React.MouseEvent) => {
    e.preventDefault()
    document.getElementById('location')?.scrollIntoView({ behavior: 'smooth' })
  }

  const logoSize = isMobile ? 44 : scrolled ? 50 : 120

  return (
    <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000, overflow: 'visible' }}>
      <div className="container" style={{ paddingTop: isMobile ? 12 : 16, paddingBottom: isMobile ? 12 : 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', overflow: 'visible' }}>

        <a href="/" style={{ display: 'block', flexShrink: 0 }}>
          <Image
            src="/images/logo.png"
            alt="Locks Flow"
            width={200}
            height={200}
            style={{ width: logoSize, height: logoSize, objectFit: 'contain', transition: 'width 0.4s ease, height 0.4s ease', display: 'block' }}
          />
        </a>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <ThemeSwitcher />
        <a
          href="#location"
          onClick={scrollToBooking}
          className="btn-fill"
          style={{
            background: '#F97316',
            color: '#080808',
            padding: isMobile ? '9px 16px' : scrolled ? '10px 20px' : '12px 25px',
            borderRadius: 50,
            fontWeight: 700,
            fontSize: isMobile ? 11 : 13,
            textDecoration: 'none',
            textTransform: 'uppercase',
            letterSpacing: 1,
            transition: 'padding 0.4s ease',
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
        >
          Book ton Flow
        </a>
        </div>

      </div>
    </nav>
  )
}
