'use client'
import Link from 'next/link'
import Parallax from './Parallax'

export default function HeroSection() {
  return (
    <section style={{
      height: '100vh',
      width: '100%',
      position: 'relative',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      background: 'transparent',
    }}>

      {/* Contenu */}
      <div className="container" style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', height: '100%', paddingTop: 120 }}>

        <Parallax speed={0.15} style={{ flex: '0 0 auto', maxWidth: 600 }}>
          <h1 style={{ fontFamily: 'var(--font-unbounded)', fontSize: 'clamp(40px,7vw,110px)', lineHeight: 0.9, fontWeight: 900, textTransform: 'uppercase', marginBottom: 20, color: '#F2EDE5' }}>
            More than<br />just{' '}
            <em style={{ fontFamily: 'var(--font-gochi)', color: '#F97316', fontStyle: 'normal', textTransform: 'lowercase', fontWeight: 400 }}>locks.</em>
          </h1>
          <p style={{ fontSize: 20, maxWidth: 500, opacity: 0.7, fontWeight: 300, marginBottom: 40, color: '#F2EDE5' }}>
            On ne coiffe pas des cheveux, on sculpte ton identite. Bienvenue dans la communaute Locks Flow.
          </p>
          <Link href="#services" className="btn-fill" style={{ background: '#F97316', color: '#080808', padding: '20px 40px', borderRadius: 50, fontWeight: 700, fontSize: 16, textDecoration: 'none', display: 'inline-block' }}>
            Decouvrir l&apos;univers
          </Link>
        </Parallax>

      </div>
    </section>
  )
}
