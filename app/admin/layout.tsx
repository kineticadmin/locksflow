export const dynamic = 'force-dynamic'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ cursor: 'auto' }}>
      {children}
    </div>
  )
}
