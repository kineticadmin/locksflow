'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { format, isBefore, startOfDay, isToday } from 'date-fns'
import { fr } from 'date-fns/locale'

interface Booking {
  id: string
  name: string
  phone: string
  email: string | null
  service: string
  date: string
  time: string
  status: 'pending' | 'confirmed' | 'cancelled'
}

const SERVICE_LABELS: Record<string, string> = {
  retwist: 'Retwist',
  depart: 'Départ de locks',
  detartrage: 'Détartrage',
  reparation: 'Réparation',
}

const STATUS_COLORS: Record<string, string> = {
  pending: '#F59E0B',
  confirmed: '#10B981',
  cancelled: '#EF4444',
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'En attente',
  confirmed: 'Confirmé',
  cancelled: 'Annulé',
}

type Tab = 'upcoming' | 'pending' | 'history'

const NAV_ITEMS = [
  { href: '/admin/bookings', label: 'Rendez-vous' },
  { href: '/admin/availability', label: 'Disponibilités' },
  { href: '/admin/media', label: 'Médias' },
]

export default function AdminBookings() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('upcoming')
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => { fetchBookings() }, [])

  async function fetchBookings() {
    setLoading(true)
    const { data } = await supabase.from('bookings').select('*').order('date', { ascending: true }).order('time', { ascending: true })
    setBookings(data || [])
    setLoading(false)
  }

  async function updateStatus(id: string, status: string) {
    await fetch('/api/bookings/update', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status }),
    })
    fetchBookings()
  }

  async function logout() {
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  const today = startOfDay(new Date())
  const upcoming = bookings.filter(b => !isBefore(new Date(b.date), today) && b.status !== 'cancelled')
  const pending  = bookings.filter(b => b.status === 'pending')
  const history  = bookings.filter(b => isBefore(new Date(b.date), today) || b.status === 'cancelled')

  const displayed = tab === 'upcoming' ? upcoming : tab === 'pending' ? pending : history

  const stats = [
    { label: "Aujourd'hui", value: upcoming.filter(b => isToday(new Date(b.date))).length, color: '#F97316' },
    { label: 'À venir', value: upcoming.length, color: '#10B981' },
    { label: 'En attente', value: pending.length, color: '#F59E0B' },
    { label: 'Total', value: bookings.length, color: '#A0A0A0' },
  ]

  return (
    <div style={{ minHeight: '100vh', background: '#080808', color: '#F2EDE5' }}>

      {/* Header */}
      <div style={{ borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '0 32px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 64 }}>
          <div style={{ fontFamily: 'var(--font-unbounded)', fontWeight: 900, fontSize: 18, color: '#F2EDE5' }}>
            locks<span style={{ color: '#F97316' }}>.</span>flow <span style={{ fontSize: 10, opacity: 0.4, fontWeight: 400 }}>admin</span>
          </div>
          <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
            {NAV_ITEMS.map(item => (
              <a key={item.href} href={item.href} style={{ color: item.href === '/admin/bookings' ? '#F97316' : 'rgba(242,237,229,0.5)', fontSize: 13, textDecoration: 'none', fontFamily: 'var(--font-unbounded)', fontSize: 11, letterSpacing: 1 }}>
                {item.label}
              </a>
            ))}
            <button onClick={logout} style={{ color: 'rgba(242,237,229,0.4)', fontSize: 12, background: 'none', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', padding: '6px 14px', borderRadius: 4 }}>
              Déconnexion
            </button>
          </div>
        </div>
      </div>

      <div style={{ padding: '32px 32px 80px' }}>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 40 }}>
          {stats.map(s => (
            <div key={s.label} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: '20px 24px' }}>
              <div style={{ fontSize: 32, fontWeight: 900, fontFamily: 'var(--font-unbounded)', color: s.color, lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 11, color: '#888', marginTop: 6, letterSpacing: 1, textTransform: 'uppercase' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 2, marginBottom: 24, background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: 4, width: 'fit-content' }}>
          {([['upcoming', 'À venir'], ['pending', 'En attente'], ['history', 'Historique']] as [Tab, string][]).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              style={{ padding: '8px 20px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 12, fontFamily: 'var(--font-unbounded)', letterSpacing: 0.5, background: tab === key ? '#F97316' : 'transparent', color: tab === key ? '#080808' : 'rgba(242,237,229,0.5)', transition: '0.2s' }}
            >
              {label} {key === 'pending' && pending.length > 0 && <span style={{ background: 'rgba(255,255,255,0.2)', borderRadius: 10, padding: '1px 6px', fontSize: 10 }}>{pending.length}</span>}
            </button>
          ))}
        </div>

        {/* Table */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#888' }}>Chargement...</div>
        ) : displayed.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#555' }}>
            <div style={{ fontSize: 40, marginBottom: 12, opacity: 0.3 }}>—</div>
            <div style={{ fontSize: 13 }}>Aucun rendez-vous ici.</div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto', borderRadius: 12, border: '1px solid rgba(255,255,255,0.07)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
                  {['Date', 'Heure', 'Client', 'Service', 'Téléphone', 'Email', 'Statut', 'Actions'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '12px 16px', color: '#666', fontSize: 10, textTransform: 'uppercase', letterSpacing: 2, fontWeight: 400, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {displayed.map((b, i) => (
                  <tr key={b.id} style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: isToday(new Date(b.date)) ? 'rgba(249,115,22,0.04)' : 'transparent', transition: 'background 0.2s' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.02)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = isToday(new Date(b.date)) ? 'rgba(249,115,22,0.04)' : 'transparent'}
                  >
                    <td style={{ padding: '14px 16px', fontSize: 13, whiteSpace: 'nowrap' }}>
                      <div style={{ color: '#F2EDE5' }}>{format(new Date(b.date), 'EEE dd MMM', { locale: fr })}</div>
                      {isToday(new Date(b.date)) && <div style={{ fontSize: 10, color: '#F97316', marginTop: 2 }}>Aujourd'hui</div>}
                    </td>
                    <td style={{ padding: '14px 16px', color: '#F2EDE5', fontSize: 13, fontWeight: 600 }}>{b.time}</td>
                    <td style={{ padding: '14px 16px', color: '#F2EDE5', fontWeight: 500 }}>{b.name}</td>
                    <td style={{ padding: '14px 16px', color: '#A0A0A0', fontSize: 13 }}>{SERVICE_LABELS[b.service] || b.service}</td>
                    <td style={{ padding: '14px 16px', fontSize: 13 }}>
                      <a href={`tel:${b.phone}`} style={{ color: '#F2EDE5', textDecoration: 'none' }}>{b.phone}</a>
                    </td>
                    <td style={{ padding: '14px 16px', color: '#666', fontSize: 13 }}>{b.email || '—'}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ background: `${STATUS_COLORS[b.status]}18`, color: STATUS_COLORS[b.status], padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap' }}>
                        {STATUS_LABELS[b.status]}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {b.status !== 'confirmed' && b.status !== 'cancelled' && (
                          <button onClick={() => updateStatus(b.id, 'confirmed')} style={{ color: '#10B981', fontSize: 11, border: '1px solid rgba(16,185,129,0.25)', padding: '5px 10px', background: 'rgba(16,185,129,0.08)', cursor: 'pointer', borderRadius: 4, whiteSpace: 'nowrap' }}>
                            ✓ Confirmer
                          </button>
                        )}
                        {b.status !== 'cancelled' && (
                          <button onClick={() => updateStatus(b.id, 'cancelled')} style={{ color: '#EF4444', fontSize: 11, border: '1px solid rgba(239,68,68,0.25)', padding: '5px 10px', background: 'rgba(239,68,68,0.08)', cursor: 'pointer', borderRadius: 4, whiteSpace: 'nowrap' }}>
                            ✕ Annuler
                          </button>
                        )}
                        {b.status === 'cancelled' && (
                          <button onClick={() => updateStatus(b.id, 'pending')} style={{ color: '#888', fontSize: 11, border: '1px solid rgba(255,255,255,0.1)', padding: '5px 10px', background: 'transparent', cursor: 'pointer', borderRadius: 4, whiteSpace: 'nowrap' }}>
                            Restaurer
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
