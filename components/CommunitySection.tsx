'use client'
import Link from 'next/link'
import Parallax from './Parallax'

export default function CommunitySection() {
  return (
    <section className="container" style={{ paddingTop: 150, paddingBottom: 150, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 100, alignItems: 'center', background: '#121212' }} id="community">
      <Parallax speed={0.25}>
        <div style={{ width: '100%', aspectRatio: '9/16', background: '#222', borderRadius: 20, position: 'relative', overflow: 'hidden', border: '8px solid #1a1a1a' }}>
          <video autoPlay muted loop playsInline style={{ width: '100%', height: '100%', objectFit: 'cover' }}>
            <source src="https://player.vimeo.com/external/394344155.sd.mp4?s=985eb930e461b369c7330263f68484196d4f488a&profile_id=165&oauth2_token_id=57447761" type="video/mp4" />
          </video>
        </div>
      </Parallax>
      <Parallax speed={0.15}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-unbounded)', fontSize: 60, lineHeight: 1, marginBottom: 30, color: '#F2EDE5' }}>
            Join the<br /><span style={{ color: '#F97316' }}>Flow Crew.</span>
          </h2>
          <p style={{ fontSize: 20, opacity: 0.7, marginBottom: 30, color: '#F2EDE5', fontWeight: 300 }}>
            C&apos;est pas juste un rendez-vous, c&apos;est un lifestyle. Suis nos transformations quotidiennes et partage ton evolution avec le tag #LocksFlowInspired.
          </p>
          <Link href="https://instagram.com/lock.flowinspired" target="_blank" style={{ display: 'inline-block', background: '#F97316', color: '#080808', fontFamily: 'var(--font-unbounded)', fontWeight: 900, padding: '15px 30px', borderRadius: 50, fontSize: 14, textDecoration: 'none' }}>
            Instagram
          </Link>
        </div>
      </Parallax>
    </section>
  )
}
