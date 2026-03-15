export const dynamic = 'force-dynamic'
import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { createClient as createServerClient } from '@/lib/supabase/server'

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// GET — config hebdo (public, utilisé par le calendrier)
export async function GET() {
  const { data, error } = await adminClient()
    .from('availability')
    .select('*')
    .order('day_of_week')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// PUT — mise à jour config (admin uniquement)
export async function PUT(req: NextRequest) {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const body: { day_of_week: number; active: boolean; slots: string[] }[] = await req.json()
  const client = adminClient()

  for (const row of body) {
    const { error } = await client
      .from('availability')
      .upsert({ day_of_week: row.day_of_week, active: row.active, slots: row.slots })
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
