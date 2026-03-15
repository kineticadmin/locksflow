'use client'
import React, { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { format, isBefore, startOfDay, isToday } from 'date-fns'
import { fr } from 'date-fns/locale'
import { useIsMobile } from '@/lib/useIsMobile'

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
  { href: '/admin/bookings', label: 'RDV' },
  { href: '/admin/availability', label: 'Dispos' },
  { href: '/admin/media', label: 'Médias' },
]

export default function AdminBookings() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<Tab>('upcoming')
  const [expandedClient, setExpandedClient] = useState<string | null>(null)
  const supabase = createClient()
  const router = useRouter()
  const isMobile = useIsMobile()

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

  const visitCount: Record<string, number> = {}
  bookings.forEach(b => { visitCount[b.phone] = (visitCount[b.phone] || 0) + 1 })

  function clientHistory(booking: Booking) {
    return bookings
      .filter(b => b.phone === booking.phone && b.id !== booking.id)
      .sort((a, b) => b.date.localeCompare(a.date))
  }

  const stats = [
    { label: "Auj.", value: upcoming.filter(b => isToday(new Date(b.date))).length, color: '#F97316' },
    { label: 'À venir', value: upcoming.length, color: '#10B981' },
    { label: 'Attente', value: pending.length, color: '#F59E0B' },
    { label: 'Total', value: bookings.length, color: '#A0A0A0' },
  ]

  const pad = isMobile ? '0 16px' : '0 32px'
  const contentPad = isMobile ? '20px 16px 60px' : '32px 32px 80px'

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
              <a key={item.href} href={item.href} style={{ color: item.href === '/admin/bookings' ? '#F97316' : 'rgba(242,237,229,0.4)', fontSize: 10, textDecoration: 'none', fontFamily: 'var(--font-unbounded)', letterSpacing: 1 }}>
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

      <div style={{ padding: contentPad }}>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: isMobile ? 10 : 16, marginBottom: isMobile ? 24 : 40 }}>
          {stats.map(s => (
            <div key={s.label} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, padding: isMobile ? '14px 12px' : '20px 24px' }}>
              <div style={{ fontSize: isMobile ? 24 : 32, fontWeight: 900, fontFamily: 'var(--font-unbounded)', color: s.color, lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 9, color: '#888', marginTop: 4, letterSpacing: 1, textTransform: 'uppercase' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 2, marginBottom: 20, background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: 4, width: isMobile ? '100%' : 'fit-content' }}>
          {([['upcoming', 'À venir'], ['pending', 'Attente'], ['history', 'Historique']] as [Tab, string][]).map(([key, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              style={{ flex: isMobile ? 1 : 'none', padding: isMobile ? '8px 4px' : '8px 20px', borderRadius: 6, border: 'none', cursor: 'pointer', fontSize: 10, fontFamily: 'var(--font-unbounded)', letterSpacing: 0.5, background: tab === key ? '#F97316' : 'transparent', color: tab === key ? '#080808' : 'rgba(242,237,229,0.5)', transition: '0.2s' }}
            >
              {label}{key === 'pending' && pending.length > 0 ? ` (${pending.length})` : ''}
            </button>
          ))}
        </div>

        {/* Contenu */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#888' }}>Chargement...</div>
        ) : displayed.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#555' }}>
            <div style={{ fontSize: 32, marginBottom: 12, opacity: 0.3 }}>—</div>
            <div style={{ fontSize: 13 }}>Aucun rendez-vous ici.</div>
          </div>
        ) : isMobile ? (
          /* Cards mobile */
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {displayed.map(b => (
              <div key={b.id} style={{ background: isToday(new Date(b.date)) ? 'rgba(249,115,22,0.06)' : 'rgba(255,255,255,0.03)', border: `1px solid ${isToday(new Date(b.date)) ? 'rgba(249,115,22,0.2)' : 'rgba(255,255,255,0.07)'}`, borderRadius: 12, padding: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 2 }}>{b.name}</div>
                    <div style={{ color: '#888', fontSize: 12 }}>{SERVICE_LABELS[b.service] || b.service}</div>
                  </div>
                  <span style={{ background: `${STATUS_COLORS[b.status]}18`, color: STATUS_COLORS[b.status], padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap' }}>
                    {STATUS_LABELS[b.status]}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 16, marginBottom: 12, fontSize: 13 }}>
                  <span style={{ color: '#F97316', fontWeight: 700 }}>{b.time}</span>
                  <span style={{ color: '#A0A0A0' }}>{format(new Date(b.date), 'EEE dd MMM', { locale: fr })}</span>
                  {isToday(new Date(b.date)) && <span style={{ color: '#F97316', fontSize: 11 }}>Aujourd'hui</span>}
                </div>
                <div style={{ display: 'flex', gap: 8, fontSize: 13, marginBottom: visitCount[b.phone] > 1 ? 8 : 12 }}>
                  <a href={`tel:${b.phone}`} style={{ color: '#F2EDE5', textDecoration: 'none' }}>{b.phone}</a>
                  {b.email && <span style={{ color: '#555' }}>· {b.email}</span>}
                </div>
                {visitCount[b.phone] > 1 && (
                  <button
                    onClick={() => setExpandedClient(expandedClient === b.id ? null : b.id)}
                    style={{ background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.25)', color: '#F97316', fontSize: 10, padding: '3px 8px', borderRadius: 20, cursor: 'pointer', fontFamily: 'var(--font-unbounded)', letterSpacing: 0.5, marginBottom: 10 }}
                  >
                    ×{visitCount[b.phone]} visites {expandedClient === b.id ? '▲' : '▼'}
                  </button>
                )}
                {expandedClient === b.id && clientHistory(b).length > 0 && (
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 10, marginBottom: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {clientHistory(b).map(h => (
                      <div key={h.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#888' }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: STATUS_COLORS[h.status], flexShrink: 0 }} />
                        <span>{format(new Date(h.date), 'dd MMM yyyy', { locale: fr })}</span>
                        <span style={{ color: '#555' }}>·</span>
                        <span>{SERVICE_LABELS[h.service] || h.service}</span>
                      </div>
                    ))}
                  </div>
                )}
                <div style={{ display: 'flex', gap: 8 }}>
                  {b.status !== 'confirmed' && b.status !== 'cancelled' && (
                    <button onClick={() => updateStatus(b.id, 'confirmed')} style={{ flex: 1, color: '#10B981', fontSize: 12, border: '1px solid rgba(16,185,129,0.25)', padding: '8px', background: 'rgba(16,185,129,0.08)', cursor: 'pointer', borderRadius: 6 }}>✓ Confirmer</button>
                  )}
                  {b.status !== 'cancelled' && (
                    <button onClick={() => updateStatus(b.id, 'cancelled')} style={{ flex: 1, color: '#EF4444', fontSize: 12, border: '1px solid rgba(239,68,68,0.25)', padding: '8px', background: 'rgba(239,68,68,0.08)', cursor: 'pointer', borderRadius: 6 }}>✕ Annuler</button>
                  )}
                  {b.status === 'cancelled' && (
                    <button onClick={() => updateStatus(b.id, 'pending')} style={{ flex: 1, color: '#888', fontSize: 12, border: '1px solid rgba(255,255,255,0.1)', padding: '8px', background: 'transparent', cursor: 'pointer', borderRadius: 6 }}>Restaurer</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Table desktop */
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
                {displayed.map(b => (
                  <React.Fragment key={b.id}>
                  <tr style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: isToday(new Date(b.date)) ? 'rgba(249,115,22,0.04)' : 'transparent', transition: 'background 0.2s' }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.02)'}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = isToday(new Date(b.date)) ? 'rgba(249,115,22,0.04)' : 'transparent'}
                  >
                    <td style={{ padding: '14px 16px', fontSize: 13, whiteSpace: 'nowrap' }}>
                      <div style={{ color: '#F2EDE5' }}>{format(new Date(b.date), 'EEE dd MMM', { locale: fr })}</div>
                      {isToday(new Date(b.date)) && <div style={{ fontSize: 10, color: '#F97316', marginTop: 2 }}>Aujourd'hui</div>}
                    </td>
                    <td style={{ padding: '14px 16px', color: '#F2EDE5', fontSize: 13, fontWeight: 600 }}>{b.time}</td>
                    <td style={{ padding: '14px 16px', color: '#F2EDE5', fontWeight: 500 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        {b.name}
                        {visitCount[b.phone] > 1 && (
                          <button
                            onClick={() => setExpandedClient(expandedClient === b.id ? null : b.id)}
                            style={{ background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.25)', color: '#F97316', fontSize: 10, padding: '2px 8px', borderRadius: 20, cursor: 'pointer', fontFamily: 'var(--font-unbounded)', letterSpacing: 0.5, whiteSpace: 'nowrap' }}
                          >
                            ×{visitCount[b.phone]} {expandedClient === b.id ? '▲' : '▼'}
                          </button>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', color: '#A0A0A0', fontSize: 13 }}>{SERVICE_LABELS[b.service] || b.service}</td>
                    <td style={{ padding: '14px 16px', fontSize: 13 }}><a href={`tel:${b.phone}`} style={{ color: '#F2EDE5', textDecoration: 'none' }}>{b.phone}</a></td>
                    <td style={{ padding: '14px 16px', color: '#666', fontSize: 13 }}>{b.email || '—'}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{ background: `${STATUS_COLORS[b.status]}18`, color: STATUS_COLORS[b.status], padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap' }}>
                        {STATUS_LABELS[b.status]}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {b.status !== 'confirmed' && b.status !== 'cancelled' && (
                          <button onClick={() => updateStatus(b.id, 'confirmed')} style={{ color: '#10B981', fontSize: 11, border: '1px solid rgba(16,185,129,0.25)', padding: '5px 10px', background: 'rgba(16,185,129,0.08)', cursor: 'pointer', borderRadius: 4, whiteSpace: 'nowrap' }}>✓ Confirmer</button>
                        )}
                        {b.status !== 'cancelled' && (
                          <button onClick={() => updateStatus(b.id, 'cancelled')} style={{ color: '#EF4444', fontSize: 11, border: '1px solid rgba(239,68,68,0.25)', padding: '5px 10px', background: 'rgba(239,68,68,0.08)', cursor: 'pointer', borderRadius: 4, whiteSpace: 'nowrap' }}>✕ Annuler</button>
                        )}
                        {b.status === 'cancelled' && (
                          <button onClick={() => updateStatus(b.id, 'pending')} style={{ color: '#888', fontSize: 11, border: '1px solid rgba(255,255,255,0.1)', padding: '5px 10px', background: 'transparent', cursor: 'pointer', borderRadius: 4, whiteSpace: 'nowrap' }}>Restaurer</button>
                        )}
                      </div>
                    </td>
                  </tr>
                  {expandedClient === b.id && clientHistory(b).length > 0 && (
                    <tr>
                      <td colSpan={8} style={{ padding: '0 16px 12px 48px', background: 'rgba(249,115,22,0.02)', borderTop: 'none' }}>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 24px' }}>
                          {clientHistory(b).map(h => (
                            <span key={h.id} style={{ fontSize: 12, color: '#666' }}>
                              <span style={{ color: STATUS_COLORS[h.status] }}>●</span>{' '}
                              {format(new Date(h.date), 'dd MMM yyyy', { locale: fr })} — {SERVICE_LABELS[h.service] || h.service}
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {isMobile && (
          <button onClick={logout} style={{ marginTop: 32, width: '100%', color: 'rgba(242,237,229,0.4)', fontSize: 12, background: 'none', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', padding: '12px', borderRadius: 6 }}>
            Déconnexion
          </button>
        )}
      </div>
    </div>
  )
}
