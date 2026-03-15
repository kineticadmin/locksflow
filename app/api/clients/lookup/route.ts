import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function GET(req: NextRequest) {
  const phone = req.nextUrl.searchParams.get('phone')?.trim()
  if (!phone || phone.length < 8) {
    return NextResponse.json({ found: false })
  }

  const supabase = getSupabase()
  const { data } = await supabase
    .from('bookings')
    .select('name, email')
    .eq('phone', phone)
    .order('date', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!data) return NextResponse.json({ found: false })

  return NextResponse.json({ found: true, name: data.name, email: data.email ?? '' })
}
