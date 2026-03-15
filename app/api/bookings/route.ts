export const dynamic = 'force-dynamic'
import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { sendBookingConfirmation, sendOwnerNotification } from '@/lib/email'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(req: NextRequest) {
  const supabase = getSupabase()
  const body = await req.json()
  const { name, phone, email, service, date, time } = body

  if (!name || !phone || !service || !date || !time) {
    return NextResponse.json({ error: 'Champs manquants' }, { status: 400 })
  }

  const { data, error } = await supabase
    .from('bookings')
    .insert([{ name, phone, email: email || null, service, date, time, status: 'pending' }])
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const dateFormatted = format(new Date(date), 'EEEE d MMMM yyyy', { locale: fr })

  Promise.all([
    sendOwnerNotification({ name, phone, service, date: dateFormatted, time }),
    email ? sendBookingConfirmation({ name, email, service, date: dateFormatted, time }) : Promise.resolve(),
  ]).catch(console.error)

  return NextResponse.json({ success: true, booking: data })
}

export async function GET() {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('bookings')
    .select('*')
    .order('date', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
