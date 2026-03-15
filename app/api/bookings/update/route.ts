import { createClient as createSupabaseAdmin } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { sendBookingConfirmed } from '@/lib/email'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

export async function PATCH(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Non autorise' }, { status: 401 })

  const supabaseAdmin = createSupabaseAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { id, status } = await req.json()

  const { data: booking, error } = await supabaseAdmin
    .from('bookings')
    .update({ status })
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  // Envoie l'email de confirmation au client quand l'admin valide
  if (status === 'confirmed' && booking?.email) {
    const dateFormatted = format(new Date(booking.date), 'EEEE d MMMM yyyy', { locale: fr })
    await sendBookingConfirmed({
      name: booking.name,
      email: booking.email,
      service: booking.service,
      date: dateFormatted,
      time: booking.time,
    }).catch(console.error)
  }

  return NextResponse.json({ success: true })
}
