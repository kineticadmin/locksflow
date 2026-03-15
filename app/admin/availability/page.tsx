'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { DayPicker } from 'react-day-picker'
import 'react-day-picker/dist/style.css'
import { format, isBefore, startOfDay } from 'date-fns'
import { fr } from 'date-fns/locale'
import { useIsMobile } from '@/lib/useIsMobile'

const ALL_SLOTS = ['09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00']
const DAYS_FULL = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']

interface DayConfig { day_of_week: number; active: boolean; slots: string[] }
interface BlockedSlot { id: string; date: string; slot: string | null; reason: string | null }

const NAV_ITEMS = [
  { href: '/admin/bookings',     label: 'RDV' },
  { href: '/admin/availability', label: 'Dispos' },
  { href: '/admin/services',     label: 'Services' },
  { href: '/admin/media',        label: 'Médias' },
]

export default function AdminAvailability() {
  const [config, setConfig] = useState<DayConfig[]>([])
  const [blocked, setBlocked] = useState<BlockedSlot[]>([])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [blockSlot, setBlockSlot] = useState<string>('__day__')
  const [blockReason, setBlockReason] = useState('')
  const [blocking, setBlocking] = useState(false)
  const supabase = createClient()
  const router = useRouter()
  const isMobile = useIsMobile()

  useEffect(() => { fetchAll() }, [])

  async function fetchAll() {
    const [avRes, blRes] = await Promise.all([
      fetch('/api/availability'),
      fetch('/api/blocked-slots'),
    ])
    setConfig(await avRes.json())
    setBlocked(await blRes.json())
  }

  async function logout() {
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  function toggleDay(dow: number) {
    setConfig(prev => prev.map(d => d.day_of_week === dow ? { ...d, active: !d.active } : d))
  }

  function toggleSlot(dow: number, slot: string) {
    setConfig(prev => prev.map(d => {
      if (d.day_of_week !== dow) return d
      const slots = d.slots.includes(slot) ? d.slots.filter(s => s !== slot) : [...d.slots, slot].sort()
      return { ...d, slots }
    }))
  }

  async function saveConfig() {
    setSaving(true)
    await fetch('/api/availability', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
    })
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  async function blockDate() {
    if (!selectedDate) return
    setBlocking(true)
    await fetch('/api/blocked-slots', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        date: format(selectedDate, 'yyyy-MM-dd'),
        slot: blockSlot === '__day__' ? null : blockSlot,
        reason: blockReason || null,
      }),
    })
    setBlocking(false)
    setSelectedDate(undefined)
    setBlockSlot('__day__')
    setBlockReason('')
    fetchAll()
  }

  async function unblock(id: string) {
    await fetch('/api/blocked-slots', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    fetchAll()
  }

  const upcomingBlocked = blocked
    .filter(b => !isBefore(new Date(b.date), startOfDay(new Date())))
    .sort((a, b) => a.date.localeCompare(b.date))

  const input: React.CSSProperties = { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#F2EDE5', padding: '10px 14px', borderRadius: 6, fontSize: 13, outline: 'none', width: '100%' }
  const pad = isMobile ? '0 16px' : '0 32px'
  const contentPad = isMobile ? '20px 16px 60px' : '32px'

  return (
    <div style={{ minHeight: '100vh', background: '#080808', color: '#F2EDE5' }}>

      {/* Header */}
      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', padding: pad }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: isMobile ? 56 : 64 }}>
          <div style={{ fontFamily: 'var(--font-unbounded)', fontWeight: 900, fontSize: isMobile ? 14 : 18, color: '#F2EDE5' }}>
            locks<span style={{ color: '#F97316' }}>.</span>flow <span style={{ fontSize: 9, opacity: 0.4, fontWeight: 400 }}>admin</span>
          </div>
          <div style={{ display: 'flex', gap: isMobile ? 16 : 32, alignItems: 'center' }}>
            {NAV_ITEMS.map(item => (
              <a key={item.href} href={item.href} style={{ color: item.href === '/admin/availability' ? '#F97316' : 'rgba(242,237,229,0.4)', fontSize: 10, textDecoration: 'none', fontFamily: 'var(--font-unbounded)', letterSpacing: 1 }}>
                {item.label}
              </a>
            ))}
            {!isMobile && (
              <button onClick={logout} style={{ color: 'rgba(242,237,229,0.4)', fontSize: 12, background: 'none', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', padding: '6px 14px', borderRadius: 4 }}>
                Déco
              </button>
            )}
          </div>
        </div>
      </div>

      <div style={{ padding: contentPad, display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 380px', gap: isMobile ? 24 : 32, alignItems: 'start' }}>

        {/* Colonne gauche — planning hebdo */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', marginBottom: 24, gap: 16 }}>
            <div>
              <h2 style={{ fontFamily: 'var(--font-unbounded)', fontSize: isMobile ? 15 : 18, fontWeight: 900, marginBottom: 4 }}>Planning hebdo</h2>
              <p style={{ color: '#888', fontSize: 12 }}>Active les jours et les créneaux disponibles.</p>
            </div>
            <button
              onClick={saveConfig}
              disabled={saving}
              style={{ background: saved ? '#10B981' : '#F97316', color: '#080808', border: 'none', padding: isMobile ? '10px 16px' : '10px 24px', borderRadius: 6, fontFamily: 'var(--font-unbounded)', fontSize: 11, fontWeight: 900, cursor: saving ? 'not-allowed' : 'pointer', letterSpacing: 1, transition: 'background 0.3s', whiteSpace: 'nowrap', flexShrink: 0 }}
            >
              {saving ? '...' : saved ? '✓ OK' : 'Sauvegarder'}
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {config.map(day => (
              <div key={day.day_of_week} style={{ background: day.active ? 'rgba(249,115,22,0.05)' : 'rgba(255,255,255,0.02)', border: `1px solid ${day.active ? 'rgba(249,115,22,0.2)' : 'rgba(255,255,255,0.06)'}`, borderRadius: 12, padding: isMobile ? '14px 16px' : '16px 20px', transition: '0.2s' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: day.active ? 16 : 0 }}>
                  {/* Toggle */}
                  <button
                    onClick={() => toggleDay(day.day_of_week)}
                    style={{ width: 40, height: 22, borderRadius: 11, background: day.active ? '#F97316' : 'rgba(255,255,255,0.15)', border: 'none', cursor: 'pointer', position: 'relative', transition: '0.2s', flexShrink: 0 }}
                  >
                    <span style={{ position: 'absolute', top: 3, left: day.active ? 21 : 3, width: 16, height: 16, borderRadius: '50%', background: '#fff', transition: '0.2s', display: 'block' }} />
                  </button>
                  <span style={{ fontFamily: 'var(--font-unbounded)', fontSize: isMobile ? 12 : 13, fontWeight: 700, color: day.active ? '#F2EDE5' : '#555', width: isMobile ? 80 : 90 }}>
                    {DAYS_FULL[day.day_of_week]}
                  </span>
                  {day.active && (
                    <span style={{ fontSize: 11, color: '#888' }}>
                      {day.slots.length} créneau{day.slots.length !== 1 ? 'x' : ''}
                    </span>
                  )}
                </div>

                {day.active && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, paddingLeft: isMobile ? 0 : 56 }}>
                    {ALL_SLOTS.map(slot => (
                      <button
                        key={slot}
                        onClick={() => toggleSlot(day.day_of_week, slot)}
                        style={{ padding: '6px 12px', borderRadius: 6, border: `1px solid ${day.slots.includes(slot) ? '#F97316' : 'rgba(255,255,255,0.1)'}`, background: day.slots.includes(slot) ? 'rgba(249,115,22,0.15)' : 'transparent', color: day.slots.includes(slot) ? '#F97316' : '#888', fontSize: 12, fontFamily: 'var(--font-unbounded)', cursor: 'pointer', transition: '0.15s' }}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Colonne droite — blocage dates */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

          {/* Calendrier blocage */}
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 20 }}>
            <h3 style={{ fontFamily: 'var(--font-unbounded)', fontSize: 14, fontWeight: 900, marginBottom: 4 }}>Bloquer une date</h3>
            <p style={{ color: '#888', fontSize: 12, marginBottom: 20 }}>Congés, fermeture exceptionnelle...</p>

            <DayPicker
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={date => isBefore(date, startOfDay(new Date()))}
              locale={fr}
              numberOfMonths={1}
              className="rdp-custom"
            />

            {selectedDate && (
              <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ fontSize: 13, color: '#F97316', fontWeight: 600 }}>
                  {format(selectedDate, 'EEEE d MMMM', { locale: fr })}
                </div>
                <select value={blockSlot} onChange={e => setBlockSlot(e.target.value)} style={input}>
                  <option value="__day__">Journée entière</option>
                  {ALL_SLOTS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <input
                  type="text"
                  placeholder="Raison (optionnel)"
                  value={blockReason}
                  onChange={e => setBlockReason(e.target.value)}
                  style={input}
                />
                <button
                  onClick={blockDate}
                  disabled={blocking}
                  style={{ background: '#F97316', color: '#080808', border: 'none', padding: '10px', borderRadius: 6, fontFamily: 'var(--font-unbounded)', fontSize: 11, fontWeight: 900, cursor: blocking ? 'not-allowed' : 'pointer' }}
                >
                  {blocking ? '...' : 'Bloquer'}
                </button>
              </div>
            )}
          </div>

          {/* Liste créneaux bloqués */}
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 20 }}>
            <h3 style={{ fontFamily: 'var(--font-unbounded)', fontSize: 14, fontWeight: 900, marginBottom: 16 }}>
              Bloqués à venir
            </h3>
            {upcomingBlocked.length === 0 ? (
              <p style={{ color: '#555', fontSize: 12 }}>Aucune date bloquée.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {upcomingBlocked.map(b => (
                  <div key={b.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 8, padding: '10px 14px' }}>
                    <div>
                      <div style={{ fontSize: 13, color: '#F2EDE5', fontWeight: 500 }}>
                        {format(new Date(b.date), 'dd MMM yyyy', { locale: fr })}
                        <span style={{ marginLeft: 8, color: '#888', fontSize: 12 }}>
                          {b.slot ?? 'Journée entière'}
                        </span>
                      </div>
                      {b.reason && <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>{b.reason}</div>}
                    </div>
                    <button
                      onClick={() => unblock(b.id)}
                      style={{ color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, lineHeight: 1, padding: '4px 8px' }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {isMobile && (
          <button onClick={logout} style={{ marginTop: 8, width: '100%', color: 'rgba(242,237,229,0.4)', fontSize: 12, background: 'none', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', padding: '12px', borderRadius: 6 }}>
            Déconnexion
          </button>
        )}
      </div>
    </div>
  )
}
