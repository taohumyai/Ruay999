import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { calculateWinners } from '@/lib/winner'
import type { Bet, PayoutRates, WinnerEntry } from '@/lib/types'

// GET /api/dashboard?round_id=xxx
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url)
    const round_id = searchParams.get('round_id')

    if (!round_id) return NextResponse.json({ error: 'ต้องระบุ round_id' }, { status: 400 })

    // Fetch all bets for round
    const { data: bets, error: betsErr } = await supabase
        .from('bets')
        .select('*')
        .eq('round_id', round_id)

    if (betsErr) return NextResponse.json({ error: betsErr.message }, { status: 500 })

    // Fetch round
    const { data: round, error: roundErr } = await supabase
        .from('rounds')
        .select('*')
        .eq('id', round_id)
        .single()

    if (roundErr) return NextResponse.json({ error: roundErr.message }, { status: 500 })

    // Fetch payout rates
    const { data: rates, error: ratesErr } = await supabase
        .from('payout_rates')
        .select('*')
        .eq('id', 1)
        .single()

    if (ratesErr) return NextResponse.json({ error: ratesErr.message }, { status: 500 })

    // Popular numbers
    const numberMap: Record<string, { count: number; total_top: number; total_bottom: number }> = {}
    for (const bet of (bets as Bet[])) {
        if (!numberMap[bet.number]) numberMap[bet.number] = { count: 0, total_top: 0, total_bottom: 0 }
        numberMap[bet.number].count++
        numberMap[bet.number].total_top += bet.top_amount
        numberMap[bet.number].total_bottom += bet.bottom_amount
    }

    const popular = Object.entries(numberMap)
        .map(([number, v]) => ({
            number,
            total_count: v.count,
            total_top: v.total_top,
            total_bottom: v.total_bottom,
        }))
        .sort((a, b) => b.total_count - a.total_count)
        .slice(0, 20)

    // Winners (only if results entered)
    let winners: WinnerEntry[] = []
    if (round.two_tail && round.three_tail) {
        winners = calculateWinners(bets as Bet[], round.two_tail, round.three_tail, rates as PayoutRates)
    }

    return NextResponse.json({ popular, winners, round, rates })
}
