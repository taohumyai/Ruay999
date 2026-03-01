import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET /api/rounds — get current open round
export async function GET() {
    const { data, error } = await supabase
        .from('rounds')
        .select('*')
        .eq('is_closed', false)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }
    return NextResponse.json({ round: data })
}

// POST /api/rounds — create a new round
export async function POST(req: Request) {
    const { label } = await req.json()
    if (!label) return NextResponse.json({ error: 'ต้องใส่ชื่องวด' }, { status: 400 })

    const { data, error } = await supabase
        .from('rounds')
        .insert({ label })
        .select()
        .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ round: data })
}

// PATCH /api/rounds — update round result
export async function PATCH(req: Request) {
    const { id, result_6digit, two_tail, three_tail, is_closed } = await req.json()
    if (!id) return NextResponse.json({ error: 'ต้องระบุ id' }, { status: 400 })

    const { data, error } = await supabase
        .from('rounds')
        .update({ result_6digit, two_tail, three_tail, is_closed })
        .eq('id', id)
        .select()
        .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ round: data })
}
