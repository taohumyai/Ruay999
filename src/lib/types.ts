export type Round = {
    id: string
    label: string
    result_6digit: string | null
    two_tail: string | null
    three_tail: string | null
    is_closed: boolean
    created_at: string
}

export type Bet = {
    id: string
    round_id: string
    buyer_name: string
    number: string
    top_amount: number
    bottom_amount: number
    created_at: string
}

export type PayoutRates = {
    id: number
    two_digit_top: number
    two_digit_bottom: number
    three_digit_top: number
    three_digit_bottom: number
}

export type BetEntry = {
    number: string
    top_amount: number
    bottom_amount: number
}

export type WinnerEntry = {
    buyer_name: string
    number: string
    type: '2-ตัวบน' | '2-ตัวล่าง' | '3-ตัวบน' | '3-ตัวล่าง'
    bet_amount: number
    prize: number
}

export type PopularNumber = {
    number: string
    total_count: number
    total_top: number
    total_bottom: number
}
