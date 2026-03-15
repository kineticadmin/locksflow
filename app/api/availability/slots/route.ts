export const dynamic = 'force-dynamic'
import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { getDay } from 'date-fns'

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

// GET /api/availability/slots?date=YYYY-MM-DD
// Retourne les créneaux disponibles pour une date donnée
export async function GET(req: NextRequest) {
  const date = req.nextUrl.searchParams.get('date')
  if (!date) return NextResponse.json({ error: 'date manquante' }, { status: 400 })

  const supabase = adminClient()
  const dayOfWeek = getDay(new Date(date + 'T12:00:00')) // midi pour éviter timezone

  // 1. Config du jour
  const { data: dayConfig } = await supabase
    .from('availability')
    .select('*')
    .eq('day_of_week', dayOfWeek)
    .single()

  if (!dayConfig || !dayConfig.active) {
    return NextResponse.json({ slots: [] })
  }

  // 2. Créneaux bloqués pour cette date
  const { data: blocked } = await supabase
    .from('blocked_slots')
    .select('slot')
    .eq('date', date)

  const blockedSlots = blocked || []
  const fullDayBlocked = blockedSlots.some(b => b.slot === null)
  if (fullDayBlocked) return NextResponse.json({ slots: [] })

  const blockedTimes = new Set(blockedSlots.map(b => b.slot))

  // 3. Créneaux déjà pris (réservations confirmées ou en attente)
  const { data: existingBookings } = await supabase
    .from('bookings')
    .select('time')
    .eq('date', date)
    .in('status', ['pending', 'confirmed'])

  const takenSlots = new Set((existingBookings || []).map(b => b.time))

  // 4. Filtrage
  const available = (dayConfig.slots as string[]).filter(
    slot => !blockedTimes.has(slot) && !takenSlots.has(slot)
  )

  return NextResponse.json({ slots: available })
}
