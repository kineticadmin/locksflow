export default function Marquee() {
  const text = 'RETWIST \u2022 DEPART \u2022 REPAIR \u2022 VIBE \u2022 COMMUNITY \u2022 NEUILLY-SUR-MARNE \u2022 93 \u2022 NO CHEMICALS \u2022 JUST ART \u00a0'
  return (
    <div style={{ background: '#F97316', color: '#080808', padding: '20px 0', fontFamily: 'var(--font-unbounded)', fontWeight: 900, overflow: 'hidden', whiteSpace: 'nowrap', transform: 'rotate(-2deg)', margin: '-90px -80px 0', position: 'relative', zIndex: 20 }}>
      <div className="animate-marquee" style={{ display: 'inline-block', fontSize: 40 }}>
        {text}{text}
      </div>
    </div>
  )
}
