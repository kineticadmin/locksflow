export const dynamic = 'force-dynamic'
import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { sendReminderEmail } from '@/lib/email'
import { format, addDays } from 'date-fns'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = getSupabase()
  const tomorrow = format(addDays(new Date(), 1), 'yyyy-MM-dd')

  const { data: bookings, error } = await supabase
    .from('bookings')
    .select('*')
    .eq('date', tomorrow)
    .eq('status', 'confirmed')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  await Promise.all(
    (bookings || [])
      .filter(b => b.email)
      .map(b => sendReminderEmail({ name: b.name, email: b.email, time: b.time }))
  )

  return NextResponse.json({ sent: bookings?.length ?? 0 })
}
