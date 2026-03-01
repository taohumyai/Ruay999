import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

// GET /api/payout
export async function GET() {
    const { data, error } = await supabase
        .from('payout_rates')
        .select('*')
        .eq('id', 1)
        .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ rates: data })
}

// PATCH /api/payout
export async function PATCH(req: Request) {
    const body = await req.json()
    const { two_digit_top, two_digit_bottom, three_digit_top, three_digit_bottom } = body

    const { data, error } = await supabase
        .from('payout_rates')
        .update({ two_digit_top, two_digit_bottom, three_digit_top, three_digit_bottom })
        .eq('id', 1)
        .select()
        .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ rates: data })
}
