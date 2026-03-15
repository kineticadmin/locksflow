'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
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
  depart: 'Depart',
  detartrage: 'Detartrage',
}

const STATUS_COLORS: Record<string, string> = {
  pending: '#F59E0B',
  confirmed: '#10B981',
  cancelled: '#EF4444',
}

export default function AdminBookings() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => { fetchBookings() }, [])

  async function fetchBookings() {
    const { data } = await supabase.from('bookings').select('*').order('date', { ascending: true })
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

  if (loading) return <div style={{ minHeight: '100vh', background: '#080808', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F2EDE5' }}>Chargement...</div>

  return (
    <div style={{ minHeight: '100vh', background: '#080808', padding: 32 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
        <div>
          <div style={{ fontFamily: 'var(--font-unbounded)', fontWeight: 900, fontSize: 24, textTransform: 'lowercase', color: '#F2EDE5' }}>locks<span style={{ color: '#F97316' }}>.</span>flow</div>
          <div style={{ color: '#A0A0A0', fontSize: 13, marginTop: 4 }}>Rendez-vous</div>
        </div>
        <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
          <a href="/admin/media" style={{ color: '#F2EDE5', opacity: 0.6, fontSize: 13, textDecoration: 'none' }}>Medias</a>
          <button onClick={logout} style={{ color: '#A0A0A0', fontSize: 13, background: 'none', border: 'none', cursor: 'pointer' }}>Deconnexion</button>
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              {['Date', 'Heure', 'Client', 'Service', 'Tel', 'Email', 'Statut', 'Actions'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '12px 16px', color: '#A0A0A0', fontSize: 11, textTransform: 'uppercase', letterSpacing: 2, fontWeight: 400 }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {bookings.map(b => (
              <tr key={b.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                <td style={{ padding: '16px', color: '#F2EDE5', fontSize: 13 }}>{format(new Date(b.date), 'dd MMM yyyy', { locale: fr })}</td>
                <td style={{ padding: '16px', color: '#F2EDE5', fontSize: 13 }}>{b.time}</td>
                <td style={{ padding: '16px', color: '#F2EDE5', fontWeight: 500 }}>{b.name}</td>
                <td style={{ padding: '16px', color: '#F2EDE5', fontSize: 13 }}>{SERVICE_LABELS[b.service]}</td>
                <td style={{ padding: '16px', color: '#F2EDE5', fontSize: 13 }}>{b.phone}</td>
                <td style={{ padding: '16px', color: '#A0A0A0', fontSize: 13 }}>{b.email || '-'}</td>
                <td style={{ padding: '16px' }}>
                  <span style={{ background: `${STATUS_COLORS[b.status]}20`, color: STATUS_COLORS[b.status], padding: '4px 10px', borderRadius: 20, fontSize: 12, fontWeight: 500 }}>
                    {b.status}
                  </span>
                </td>
                <td style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {b.status !== 'confirmed' && (
                      <button onClick={() => updateStatus(b.id, 'confirmed')} style={{ color: '#10B981', fontSize: 12, border: '1px solid rgba(16,185,129,0.3)', padding: '4px 10px', background: 'none', cursor: 'pointer', borderRadius: 4 }}>
                        Confirmer
                      </button>
                    )}
                    {b.status !== 'cancelled' && (
                      <button onClick={() => updateStatus(b.id, 'cancelled')} style={{ color: '#EF4444', fontSize: 12, border: '1px solid rgba(239,68,68,0.3)', padding: '4px 10px', background: 'none', cursor: 'pointer', borderRadius: 4 }}>
                        Annuler
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {bookings.length === 0 && (
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#A0A0A0' }}>Aucun rendez-vous pour le moment.</div>
        )}
      </div>
    </div>
  )
}
