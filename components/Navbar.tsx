'use client'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const scrollToBooking = (e: React.MouseEvent) => {
    e.preventDefault()
    document.getElementById('location')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000, overflow: 'visible' }}>
      <div className="container" style={{ paddingTop: 16, paddingBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', overflow: 'visible' }}>

        <Link href="/" style={{ display: 'block', flexShrink: 0 }}>
          <Image
            src="/images/logo.png"
            alt="Locks Flow"
            width={200}
            height={200}
            style={{ width: scrolled ? 50 : 120, height: scrolled ? 50 : 120, objectFit: 'contain', transition: 'width 0.4s ease, height 0.4s ease', display: 'block' }}
          />
        </Link>

        <a
          href="#location"
          onClick={scrollToBooking}
          className="btn-fill"
          style={{ background: '#F97316', color: '#080808', padding: scrolled ? '10px 20px' : '12px 25px', borderRadius: 50, fontWeight: 700, fontSize: 13, textDecoration: 'none', textTransform: 'uppercase', letterSpacing: 1, transition: 'padding 0.4s ease', whiteSpace: 'nowrap', marginTop: 20, flexShrink: 0 }}
        >
          Book ton Flow
        </a>

      </div>
    </nav>
  )
}
