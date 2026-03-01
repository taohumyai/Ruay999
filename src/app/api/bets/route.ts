import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import type { BetEntry } from '@/lib/types'

// POST /api/bets — submit a bet slip
export async function POST(req: Request) {
    const { round_id, buyer_name, entries } = await req.json() as {
        round_id: string
        buyer_name: string
        entries: BetEntry[]
    }

    if (!round_id || !buyer_name || !entries?.length) {
        return NextResponse.json({ error: 'ข้อมูลไม่ครบถ้วน' }, { status: 400 })
    }

    const rows = entries.map((e) => ({
        round_id,
        buyer_name,
        number: e.number,
        top_amount: e.top_amount,
        bottom_amount: e.bottom_amount,
    }))

    const { data, error } = await supabase.from('bets').insert(rows).select()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ bets: data })
}

// GET /api/bets?round_id=xxx — get all bets for a round
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url)
    const round_id = searchParams.get('round_id')

    if (!round_id) return NextResponse.json({ error: 'ต้องระบุ round_id' }, { status: 400 })

    const { data, error } = await supabase
        .from('bets')
        .select('*')
        .eq('round_id', round_id)
        .order('created_at', { ascending: true })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ bets: data })
}

// DELETE /api/bets?id=xxx — delete a specific bet
export async function DELETE(req: Request) {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) return NextResponse.json({ error: 'ต้องระบุ id ของรายการที่จะลบ' }, { status: 400 })

    const { error } = await supabase.from('bets').delete().eq('id', id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ success: true })
}
