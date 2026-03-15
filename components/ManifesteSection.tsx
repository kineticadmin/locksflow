export default function ManifesteSection() {
  return (
    <section style={{ background: 'transparent', position: 'relative', overflow: 'hidden' }}>
      <div className="container" style={{ paddingTop: 120, paddingBottom: 120, textAlign: 'center' }}>
      <div style={{ fontFamily: 'var(--font-unbounded)', fontSize: 'clamp(28px,5vw,72px)', fontWeight: 900, letterSpacing: -2, lineHeight: 1.05, position: 'relative', maxWidth: 900, margin: '0 auto 40px', color: '#F2EDE5' }}>
        Le flow c&apos;est pas<br />une coiffure.<br />
        C&apos;est{' '}
        <em style={{ fontStyle: 'italic', fontFamily: 'var(--font-gochi)', fontWeight: 400, color: '#F97316' }}>un état d&apos;esprit</em>
        <br />qui finit par pousser<br />sur ta tête.
      </div>
      <p style={{ fontSize: 16, color: 'rgba(242,237,229,0.45)', fontWeight: 300, maxWidth: 480, margin: '0 auto', lineHeight: 1.8 }}>
        Locks Flow. Neuilly-sur-Marne. Pour ceux qui assument.
      </p>
      </div>
    </section>
  )
}
