export default function Footer() {
  return (
    <footer style={{ background: 'rgba(8,8,8,0.82)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="container" style={{ paddingTop: 48, paddingBottom: 48, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' as const, gap: 24 }}>
      <div>
        <div style={{ fontFamily: 'var(--font-unbounded)', fontSize: 20, fontWeight: 900, letterSpacing: -0.5, color: '#F2EDE5' }}>
          locks<span style={{ color: '#F97316' }}>.</span>flow
        </div>
        <div style={{ fontSize: 13, color: '#888', fontStyle: 'italic', fontFamily: 'var(--font-gochi)' }}>Tes locks, ton flow.</div>
      </div>
      <div style={{ fontSize: 12, color: '#888' }}>© 2025 Locks Flow · Salon de Locks · Neuilly-sur-Marne</div>
      </div>
    </footer>
  )
}
