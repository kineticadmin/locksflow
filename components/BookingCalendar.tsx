'use client'
import { useState, useEffect } from 'react'
import { DayPicker } from 'react-day-picker'
import 'react-day-picker/dist/style.css'
import { format, isBefore, startOfDay, getDay } from 'date-fns'
import { fr } from 'date-fns/locale'
import { useIsMobile } from '@/lib/useIsMobile'
import { useTheme } from '@/lib/ThemeContext'

interface ServiceItem { id: string; name: string; price: string; unit: string }
interface DayConfig { day_of_week: number; active: boolean; slots: string[] }

function StepLabel({ n, label }: { n: number; label: string }) {
  const { fg } = useTheme()
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
      <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#F97316', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-unbounded)', fontSize: 12, fontWeight: 900, color: '#080808', flexShrink: 0 }}>{n}</div>
      <span style={{ fontFamily: 'var(--font-unbounded)', fontSize: 13, color: fg }}>{label}</span>
    </div>
  )
}

export default function BookingCalendar() {
  const [step, setStep]       = useState(1)
  const [leaving, setLeaving] = useState(false)
  const [service, setService] = useState('')
  const [date, setDate]       = useState<Date>()
  const [time, setTime]       = useState('')
  const [name, setName]       = useState('')
  const [phone, setPhone]     = useState('')
  const [email, setEmail]     = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError]     = useState('')
  const [returningClient, setReturningClient] = useState<string | null>(null)
  const isMobile = useIsMobile()
  const isTablet = useIsMobile(1024)
  const { fg, fgMuted, border, borderMed, borderStr } = useTheme()
  const inputStyle: React.CSSProperties = { background: 'transparent', border: `1px solid ${borderStr}`, color: fg, padding: '14px 16px', outline: 'none', width: '100%', fontSize: 16, borderRadius: 4 }
  const [services, setServices] = useState<ServiceItem[]>([])
  const [availConfig, setAvailConfig] = useState<DayConfig[]>([])
  const [availSlots, setAvailSlots] = useState<string[]>([])
  const [loadingSlots, setLoadingSlots] = useState(false)

  useEffect(() => {
    fetch('/api/services')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setServices(data) })
      .catch(() => {})
  }, [])

  // Charge la config hebdo une fois au mount
  useEffect(() => {
    fetch('/api/availability')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setAvailConfig(data) })
      .catch(() => {})
  }, [])

  // Charge les slots disponibles quand une date est sélectionnée
  useEffect(() => {
    if (!date) return
    setLoadingSlots(true)
    const dateStr = format(date, 'yyyy-MM-dd')
    fetch(`/api/availability/slots?date=${dateStr}`)
      .then(r => r.json())
      .then(data => { if (data.slots) setAvailSlots(data.slots) })
      .catch(() => {})
      .finally(() => setLoadingSlots(false))
  }, [date])

  function isDisabledDay(d: Date) {
    if (isBefore(d, startOfDay(new Date()))) return true
    if (availConfig.length === 0) return getDay(d) === 0 // fallback
    const cfg = availConfig.find(c => c.day_of_week === getDay(d))
    return !cfg || !cfg.active
  }

  useEffect(() => {
    const handler = (e: Event) => {
      const id = (e as CustomEvent<{ service: string }>).detail.service
      setService(id)
      setStep(2)
      setLeaving(false)
    }
    window.addEventListener('select-service', handler)
    return () => window.removeEventListener('select-service', handler)
  }, [])

  async function handlePhoneBlur() {
    const cleaned = phone.trim()
    if (cleaned.length < 8) return
    try {
      const res = await fetch(`/api/clients/lookup?phone=${encodeURIComponent(cleaned)}`)
      const data = await res.json()
      if (data.found) {
        if (!name)  setName(data.name)
        if (!email) setEmail(data.email)
        setReturningClient(data.name.split(' ')[0])
      }
    } catch {}
  }

  function goTo(next: number) {
    setLeaving(true)
    setTimeout(() => {
      setStep(next)
      setLeaving(false)
    }, 260)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!service || !date || !time || !name || !phone) {
      setError('Remplis tous les champs.')
      return
    }
    setLoading(true)
    setError('')
    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, phone: phone.replace(/\D/g, ''), email: email || undefined, service, date: format(date, 'yyyy-MM-dd'), time }),
    })
    setLoading(false)
    if (res.ok) setSuccess(true)
    else setError('Une erreur est survenue. Reessaie.')
  }

  if (success) {
    return (
      <div className="step-in" style={{ textAlign: 'center', padding: '40px 0' }}>
        <div style={{ fontFamily: 'var(--font-unbounded)', fontSize: 24, color: fg, marginBottom: 12 }}>C&apos;est dans le flow !</div>
        <p style={{ color: fg, opacity: 0.7 }}>Confirmation envoyée. On t&apos;attend !</p>
      </div>
    )
  }

  const steps = ['Service', 'Date', 'Créneau', 'Infos']

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: '100%' }}>

      <div style={{ display: 'flex', gap: 8, marginBottom: 32 }}>
        {steps.map((s, i) => (
          <div key={s} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ height: 2, background: step > i + 1 ? '#F97316' : step === i + 1 ? '#F97316' : border, transition: 'background 0.3s' }} />
            <span style={{ fontSize: 9, letterSpacing: 1, textTransform: 'uppercase', color: step >= i + 1 ? '#F97316' : fgMuted, fontFamily: 'var(--font-unbounded)', transition: 'color 0.3s' }}>{s}</span>
          </div>
        ))}
      </div>

      <div className={leaving ? 'step-out' : 'step-in'} key={step}>

        {step === 1 && (
          <>
            <StepLabel n={1} label="Choisis ton service" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
              {services.map(s => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => { setService(s.name); goTo(2) }}
                  style={{ padding: '16px 12px', border: `1px solid ${service === s.name ? '#F97316' : borderMed}`, background: service === s.name ? 'rgba(249,115,22,0.1)' : 'transparent', textAlign: 'left', cursor: 'pointer', transition: '0.2s', borderRadius: 4 }}
                >
                  <div style={{ fontFamily: 'var(--font-unbounded)', color: fg, marginBottom: 6, fontSize: 11 }}>{s.name}</div>
                  <div style={{ color: '#F97316', fontWeight: 700, fontSize: 13 }}>{s.price}{s.unit && <span style={{ color: fgMuted, fontSize: 11, fontWeight: 400 }}> {s.unit}</span>}</div>
                </button>
              ))}
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <StepLabel n={2} label="Choisis une date" />
            <div style={{ overflowX: 'auto' }}>
              <DayPicker
                mode="single"
                selected={date}
                onSelect={d => { setDate(d); if (d) goTo(3) }}
                disabled={isDisabledDay}
                locale={fr}
                numberOfMonths={(isMobile || isTablet) ? 1 : 2}
                className="rdp-custom"
              />
            </div>
            <BackBtn onClick={() => goTo(1)} />
          </>
        )}

        {step === 3 && (
          <>
            <StepLabel n={3} label="Choisis un créneau" />
            {loadingSlots ? (
              <div style={{ color: fgMuted, fontSize: 13, padding: '20px 0' }}>Chargement des créneaux...</div>
            ) : availSlots.length === 0 ? (
              <div style={{ color: fgMuted, fontSize: 13, padding: '20px 0' }}>Aucun créneau disponible pour cette date.</div>
            ) : (
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(3, 1fr)' : 'repeat(4, 1fr)', gap: 8 }}>
              {availSlots.map(slot => (
                <button
                  key={slot}
                  type="button"
                  onClick={() => { setTime(slot); goTo(4) }}
                  style={{ padding: '10px', border: `1px solid ${time === slot ? '#F97316' : borderMed}`, background: time === slot ? '#F97316' : 'transparent', color: time === slot ? '#080808' : fg, fontFamily: 'var(--font-unbounded)', fontSize: 11, cursor: 'pointer', transition: '0.2s', borderRadius: 4 }}
                >
                  {slot}
                </button>
              ))}
            </div>
            )}
            <BackBtn onClick={() => goTo(2)} />
          </>
        )}

        {step === 4 && (
          <>
            <StepLabel n={4} label="Tes infos" />
            {returningClient && (
              <div style={{ background: 'rgba(249,115,22,0.08)', border: '1px solid rgba(249,115,22,0.25)', borderRadius: 8, padding: '12px 16px', marginBottom: 12, fontSize: 13, color: '#F97316', fontWeight: 500 }}>
                Content de te revoir, {returningClient} !
              </div>
            )}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
              <input type="text"  placeholder="Ton prénom *"         value={name}  onChange={e => setName(e.target.value)}  style={inputStyle} />
              <input type="tel"   placeholder="Ton téléphone *"      value={phone} onChange={e => { setPhone(e.target.value); setReturningClient(null) }} onBlur={handlePhoneBlur} style={inputStyle} />
              <input type="email" placeholder="Email (confirmation)" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} />
            </div>
            {error && <p style={{ color: '#f87171', marginBottom: 16, fontSize: 14 }}>{error}</p>}
            <button
              type="submit"
              disabled={loading || !name || !phone}
              className="btn-fill"
              style={{ width: '100%', background: '#F97316', color: '#080808', fontFamily: 'var(--font-unbounded)', fontWeight: 900, padding: '16px', fontSize: 14, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', opacity: (!name || !phone) ? 0.4 : 1, transition: '0.2s', borderRadius: 4 }}
            >
              {loading ? 'Envoi...' : 'Valider mon RDV'}
            </button>
            <BackBtn onClick={() => goTo(3)} />
          </>
        )}

      </div>
    </form>
  )
}

function BackBtn({ onClick }: { onClick: () => void }) {
  const { fg, borderStr } = useTheme()
  return (
    <button
      type="button"
      onClick={onClick}
      className="btn-fill"
      style={{ marginTop: 24, background: 'transparent', border: `1px solid ${borderStr}`, color: fg, fontSize: 12, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8, padding: '10px 20px', borderRadius: 100, transition: '0.2s' }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = '#F97316'; (e.currentTarget as HTMLElement).style.color = '#F97316' }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = borderStr; (e.currentTarget as HTMLElement).style.color = fg }}
    >
      ← Retour
    </button>
  )
}
