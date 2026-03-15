'use client'
import React, { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useIsMobile } from '@/lib/useIsMobile'

interface Service {
  id: string
  name: string
  desc: string
  price: string
  unit: string
  active: boolean
  sort_order: number
}

type FormState = Omit<Service, 'id' | 'sort_order'>
const EMPTY: FormState = { name: '', desc: '', price: 'Sur devis', unit: '', active: true }

const NAV_ITEMS = [
  { href: '/admin/bookings',     label: 'RDV' },
  { href: '/admin/availability', label: 'Dispos' },
  { href: '/admin/services',     label: 'Services' },
  { href: '/admin/media',        label: 'Médias' },
]

export default function AdminServices() {
  const [services, setServices] = useState<Service[]>([])
  const [editing, setEditing] = useState<Service | null>(null)
  const [creating, setCreating] = useState(false)
  const [form, setForm] = useState<FormState>(EMPTY)
  const [saving, setSaving] = useState(false)
  const supabase = createClient()
  const router = useRouter()
  const isMobile = useIsMobile()

  useEffect(() => { fetchAll() }, [])

  async function fetchAll() {
    const { data } = await supabase
      .from('services')
      .select('*')
      .order('sort_order', { ascending: true })
    setServices(data || [])
  }

  async function logout() {
    await supabase.auth.signOut()
    router.push('/admin/login')
  }

  async function save() {
    setSaving(true)
    if (editing) {
      await fetch('/api/services', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editing.id, ...form }),
      })
    } else {
      await fetch('/api/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, sort_order: services.length }),
      })
    }
    setSaving(false)
    setEditing(null)
    setCreating(false)
    setForm(EMPTY)
    fetchAll()
  }

  async function toggleActive(s: Service) {
    await fetch('/api/services', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: s.id, active: !s.active }),
    })
    fetchAll()
  }

  async function moveOrder(s: Service, dir: -1 | 1) {
    const idx = services.findIndex(x => x.id === s.id)
    const other = services[idx + dir]
    if (!other) return
    await Promise.all([
      fetch('/api/services', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: s.id, sort_order: other.sort_order }) }),
      fetch('/api/services', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: other.id, sort_order: s.sort_order }) }),
    ])
    fetchAll()
  }

  async function remove(id: string) {
    if (!confirm('Supprimer ce service définitivement ?')) return
    await fetch('/api/services', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    fetchAll()
  }

  function startEdit(s: Service) {
    setEditing(s)
    setCreating(true)
    setForm({ name: s.name, desc: s.desc, price: s.price, unit: s.unit, active: s.active })
  }

  function cancel() {
    setEditing(null)
    setCreating(false)
    setForm(EMPTY)
  }

  const input: React.CSSProperties = {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: '#F2EDE5',
    padding: '10px 14px',
    borderRadius: 6,
    fontSize: 13,
    outline: 'none',
    width: '100%',
  }
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
              <a key={item.href} href={item.href} style={{ color: item.href === '/admin/services' ? '#F97316' : 'rgba(242,237,229,0.4)', fontSize: 10, textDecoration: 'none', fontFamily: 'var(--font-unbounded)', letterSpacing: 1 }}>
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

      <div style={{ padding: contentPad, display: 'grid', gridTemplateColumns: creating ? (isMobile ? '1fr' : '1fr 420px') : '1fr', gap: 32, alignItems: 'start' }}>

        {/* Liste */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <div>
              <h2 style={{ fontFamily: 'var(--font-unbounded)', fontSize: isMobile ? 15 : 18, fontWeight: 900, marginBottom: 4 }}>Services</h2>
              <p style={{ color: '#888', fontSize: 12 }}>Les changements sont visibles sur le site immédiatement.</p>
            </div>
            {!creating && (
              <button
                onClick={() => setCreating(true)}
                style={{ background: '#F97316', color: '#080808', border: 'none', padding: isMobile ? '10px 16px' : '10px 24px', borderRadius: 6, fontFamily: 'var(--font-unbounded)', fontSize: 11, fontWeight: 900, cursor: 'pointer', letterSpacing: 1, whiteSpace: 'nowrap', flexShrink: 0 }}
              >
                + Ajouter
              </button>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {services.map((s, idx) => (
              <div key={s.id} style={{ background: s.active ? 'rgba(249,115,22,0.04)' : 'rgba(255,255,255,0.02)', border: `1px solid ${s.active ? 'rgba(249,115,22,0.15)' : 'rgba(255,255,255,0.06)'}`, borderRadius: 12, padding: isMobile ? '14px 16px' : '16px 20px' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>

                  {/* Boutons ordre */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2, flexShrink: 0, paddingTop: 2 }}>
                    <button onClick={() => moveOrder(s, -1)} disabled={idx === 0} style={{ background: 'none', border: 'none', color: idx === 0 ? '#2a2a2a' : '#555', cursor: idx === 0 ? 'default' : 'pointer', fontSize: 10, padding: '2px 4px', lineHeight: 1 }}>▲</button>
                    <button onClick={() => moveOrder(s, 1)} disabled={idx === services.length - 1} style={{ background: 'none', border: 'none', color: idx === services.length - 1 ? '#2a2a2a' : '#555', cursor: idx === services.length - 1 ? 'default' : 'pointer', fontSize: 10, padding: '2px 4px', lineHeight: 1 }}>▼</button>
                  </div>

                  {/* Contenu */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 4 }}>
                      <span style={{ fontFamily: 'var(--font-unbounded)', fontSize: 13, fontWeight: 700, color: s.active ? '#F2EDE5' : '#444' }}>{s.name}</span>
                      <span style={{ color: '#F97316', fontWeight: 700, fontSize: 13 }}>
                        {s.price}
                        {s.unit && <span style={{ color: '#666', fontSize: 11, fontWeight: 400 }}> {s.unit}</span>}
                      </span>
                      {!s.active && (
                        <span style={{ fontSize: 9, color: '#444', fontFamily: 'var(--font-unbounded)', letterSpacing: 1, border: '1px solid #333', padding: '2px 6px', borderRadius: 4 }}>INACTIF</span>
                      )}
                    </div>
                    <p style={{ color: '#555', fontSize: 12, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.desc}</p>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    <button onClick={() => startEdit(s)} style={{ color: '#F2EDE5', fontSize: 11, border: '1px solid rgba(255,255,255,0.12)', padding: '5px 10px', background: 'transparent', cursor: 'pointer', borderRadius: 4 }}>
                      Éditer
                    </button>
                    <button
                      onClick={() => toggleActive(s)}
                      style={{ color: s.active ? '#EF4444' : '#10B981', fontSize: 11, border: `1px solid ${s.active ? 'rgba(239,68,68,0.25)' : 'rgba(16,185,129,0.25)'}`, padding: '5px 10px', background: 'transparent', cursor: 'pointer', borderRadius: 4, whiteSpace: 'nowrap' }}
                    >
                      {s.active ? 'Désactiver' : 'Activer'}
                    </button>
                    <button onClick={() => remove(s.id)} style={{ color: '#444', fontSize: 13, border: '1px solid rgba(255,255,255,0.06)', padding: '4px 8px', background: 'transparent', cursor: 'pointer', borderRadius: 4, lineHeight: 1 }}>
                      ×
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {services.length === 0 && (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#555', fontSize: 13 }}>
                Aucun service. Clique sur "+ Ajouter" pour commencer.
              </div>
            )}
          </div>
        </div>

        {/* Formulaire création / édition */}
        {creating && (
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 12, padding: 20 }}>
            <h3 style={{ fontFamily: 'var(--font-unbounded)', fontSize: 14, fontWeight: 900, marginBottom: 4 }}>
              {editing ? 'Modifier le service' : 'Nouveau service'}
            </h3>
            <p style={{ color: '#888', fontSize: 12, marginBottom: 20 }}>
              Visible sur le site et dans le formulaire de réservation.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <input
                placeholder="Nom du service *"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                style={input}
              />
              <textarea
                placeholder="Description"
                value={form.desc}
                onChange={e => setForm(f => ({ ...f, desc: e.target.value }))}
                rows={3}
                style={{ ...input, resize: 'vertical' }}
              />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <input
                  placeholder="Prix (ex: 50€)"
                  value={form.price}
                  onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                  style={input}
                />
                <input
                  placeholder="Unité (ex: / session)"
                  value={form.unit}
                  onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}
                  style={input}
                />
              </div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 13, color: '#888' }}>
                <button
                  type="button"
                  onClick={() => setForm(f => ({ ...f, active: !f.active }))}
                  style={{ width: 36, height: 20, borderRadius: 10, background: form.active ? '#F97316' : 'rgba(255,255,255,0.15)', border: 'none', cursor: 'pointer', position: 'relative', flexShrink: 0, transition: '0.2s' }}
                >
                  <span style={{ position: 'absolute', top: 2, left: form.active ? 18 : 2, width: 16, height: 16, borderRadius: '50%', background: '#fff', transition: '0.2s', display: 'block' }} />
                </button>
                Actif (visible sur le site)
              </label>
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <button
                onClick={save}
                disabled={saving || !form.name}
                style={{ flex: 1, background: '#F97316', color: '#080808', border: 'none', padding: '10px', borderRadius: 6, fontFamily: 'var(--font-unbounded)', fontSize: 11, fontWeight: 900, cursor: (saving || !form.name) ? 'not-allowed' : 'pointer', opacity: !form.name ? 0.4 : 1 }}
              >
                {saving ? '...' : editing ? 'Enregistrer' : 'Créer'}
              </button>
              <button
                onClick={cancel}
                style={{ color: '#888', fontSize: 12, background: 'none', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', padding: '10px 16px', borderRadius: 6 }}
              >
                Annuler
              </button>
            </div>
          </div>
        )}

        {isMobile && !creating && (
          <button onClick={logout} style={{ width: '100%', color: 'rgba(242,237,229,0.4)', fontSize: 12, background: 'none', border: '1px solid rgba(255,255,255,0.1)', cursor: 'pointer', padding: '12px', borderRadius: 6 }}>
            Déconnexion
          </button>
        )}
      </div>
    </div>
  )
}
