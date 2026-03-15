'use client'
import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface MediaItem {
  id: string
  url: string
  type: 'photo' | 'video'
  caption: string | null
}

export default function AdminMedia() {
  const [items, setItems] = useState<MediaItem[]>([])
  const [uploading, setUploading] = useState(false)
  const [caption, setCaption] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => { fetchMedia() }, [])

  async function fetchMedia() {
    const { data } = await supabase.from('media').select('*').order('order', { ascending: true })
    setItems(data || [])
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const formData = new FormData()
    formData.append('file', file)
    formData.append('caption', caption)
    await fetch('/api/media', { method: 'POST', body: formData })
    setCaption('')
    if (fileInputRef.current) fileInputRef.current.value = ''
    setUploading(false)
    fetchMedia()
  }

  async function handleDelete(id: string, url: string) {
    if (!confirm('Supprimer ce media ?')) return
    await fetch('/api/media', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, url }),
    })
    fetchMedia()
  }

  const inputStyle = {
    background: 'transparent',
    border: '1px solid rgba(255,255,255,0.2)',
    color: '#F2EDE5',
    padding: '12px 16px',
    outline: 'none',
    width: '100%',
    fontSize: 14,
  }

  return (
    <div style={{ minHeight: '100vh', background: '#080808', padding: 32 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
        <div>
          <div style={{ fontFamily: 'var(--font-unbounded)', fontWeight: 900, fontSize: 24, textTransform: 'lowercase', color: '#F2EDE5' }}>locks<span style={{ color: '#F97316' }}>.</span>flow</div>
          <div style={{ color: '#A0A0A0', fontSize: 13, marginTop: 4 }}>Medias</div>
        </div>
        <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
          <a href="/admin/bookings" style={{ color: '#F2EDE5', opacity: 0.6, fontSize: 13, textDecoration: 'none' }}>RDV</a>
          <button onClick={async () => { await supabase.auth.signOut(); router.push('/admin/login') }} style={{ color: '#A0A0A0', fontSize: 13, background: 'none', border: 'none', cursor: 'pointer' }}>Deconnexion</button>
        </div>
      </div>

      <div style={{ border: '1px solid rgba(255,255,255,0.1)', padding: 32, marginBottom: 40, maxWidth: 480 }}>
        <h2 style={{ fontFamily: 'var(--font-unbounded)', color: '#F2EDE5', fontSize: 16, marginBottom: 24 }}>Ajouter un media</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input type="text" placeholder="Legende (optionnel)" value={caption} onChange={e => setCaption(e.target.value)} style={inputStyle} />
          <input ref={fileInputRef} type="file" accept="image/*,video/*" onChange={handleUpload} style={{ display: 'none' }} />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            style={{ background: '#F97316', color: '#080808', fontFamily: 'var(--font-unbounded)', fontWeight: 900, padding: '16px', border: 'none', cursor: uploading ? 'not-allowed' : 'pointer', opacity: uploading ? 0.5 : 1 }}
          >
            {uploading ? 'Upload en cours...' : 'Choisir une photo ou video'}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
        {items.map(item => (
          <div key={item.id} style={{ position: 'relative' }} className="group">
            {item.type === 'video' ? (
              <video src={item.url} style={{ width: '100%', height: 200, objectFit: 'cover', display: 'block' }} muted />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={item.url} alt={item.caption || ''} style={{ width: '100%', height: 200, objectFit: 'cover', display: 'block' }} />
            )}
            <button
              onClick={() => handleDelete(item.id, item.url)}
              style={{ position: 'absolute', top: 8, right: 8, background: '#EF4444', color: 'white', fontSize: 11, padding: '4px 8px', border: 'none', cursor: 'pointer', opacity: 0, transition: '0.2s' }}
              className="group-hover:opacity-100"
            >
              Sup.
            </button>
            {item.caption && <div style={{ color: '#A0A0A0', fontSize: 12, marginTop: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.caption}</div>}
          </div>
        ))}
      </div>
    </div>
  )
}
