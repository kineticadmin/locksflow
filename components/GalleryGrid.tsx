'use client'
import { useTheme } from '@/lib/ThemeContext'

interface MediaItem {
  id: string
  url: string
  type: 'photo' | 'video'
  caption: string | null
}

export default function GalleryGrid({ items }: { items: MediaItem[] }) {
  const { fg } = useTheme()
  if (items.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 0', color: fg, opacity: 0.4 }}>
        <p style={{ fontFamily: 'var(--font-unbounded)' }}>Les photos arrivent bientot...</p>
      </div>
    )
  }

  return (
    <div style={{ columns: '1', gap: 16 }} className="md:columns-2 lg:columns-3">
      {items.map(item => (
        <div key={item.id} style={{ breakInside: 'avoid', marginBottom: 16, position: 'relative', overflow: 'hidden' }} className="group">
          {item.type === 'video' ? (
            <video
              src={item.url}
              style={{ width: '100%', objectFit: 'cover', display: 'block' }}
              autoPlay muted loop playsInline
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={item.url} alt={item.caption || 'Locks Flow'} style={{ width: '100%', objectFit: 'cover', display: 'block' }} />
          )}
          {item.caption && (
            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.7)', color: '#F2EDE5', fontSize: 13, padding: 12, transform: 'translateY(100%)', transition: '0.3s' }} className="group-hover:translate-y-0">
              {item.caption}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
