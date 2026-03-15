export const dynamic = 'force-dynamic'
import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function GET() {
  const supabase = getSupabase()
  const { data, error } = await supabase
    .from('media')
    .select('*')
    .order('order', { ascending: true })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const supabase = getSupabase()
  const formData = await req.formData()
  const file = formData.get('file') as File
  const caption = (formData.get('caption') as string) || ''

  if (!file) return NextResponse.json({ error: 'Fichier manquant' }, { status: 400 })

  const ext = file.name.split('.').pop()
  const fileName = `${Date.now()}.${ext}`
  const type = file.type.startsWith('video') ? 'video' : 'photo'

  const { error: uploadError } = await supabase.storage
    .from('media')
    .upload(fileName, file, { contentType: file.type })

  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 })

  const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(fileName)

  const { data, error } = await supabase
    .from('media')
    .insert([{ url: publicUrl, type, caption }])
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true, media: data })
}

export async function DELETE(req: NextRequest) {
  const supabase = getSupabase()
  const { id, url } = await req.json()
  const fileName = url.split('/').pop()

  await supabase.storage.from('media').remove([fileName])
  const { error } = await supabase.from('media').delete().eq('id', id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
