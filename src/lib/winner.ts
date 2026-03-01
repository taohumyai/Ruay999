import { Bet, PayoutRates, WinnerEntry } from './types'

export function calculateWinners(
    bets: Bet[],
    twoTail: string,
    threeTail: string,
    rates: PayoutRates
): WinnerEntry[] {
    const winners: WinnerEntry[] = []

    for (const bet of bets) {
        const num = bet.number.trim()
        const digits = num.length

        if (digits === 2) {
            // 2-ตัวบน
            if (num === twoTail && bet.top_amount > 0) {
                winners.push({
                    buyer_name: bet.buyer_name,
                    number: num,
                    type: '2-ตัวบน',
                    bet_amount: bet.top_amount,
                    prize: bet.top_amount * rates.two_digit_top,
                })
            }
            // 2-ตัวล่าง
            if (num === twoTail && bet.bottom_amount > 0) {
                winners.push({
                    buyer_name: bet.buyer_name,
                    number: num,
                    type: '2-ตัวล่าง',
                    bet_amount: bet.bottom_amount,
                    prize: bet.bottom_amount * rates.two_digit_bottom,
                })
            }
        } else if (digits === 3) {
            // 3-ตัวบน
            if (num === threeTail && bet.top_amount > 0) {
                winners.push({
                    buyer_name: bet.buyer_name,
                    number: num,
                    type: '3-ตัวบน',
                    bet_amount: bet.top_amount,
                    prize: bet.top_amount * rates.three_digit_top,
                })
            }
            // 3-ตัวล่าง
            if (num === threeTail && bet.bottom_amount > 0) {
                winners.push({
                    buyer_name: bet.buyer_name,
                    number: num,
                    type: '3-ตัวล่าง',
                    bet_amount: bet.bottom_amount,
                    prize: bet.bottom_amount * rates.three_digit_bottom,
                })
            }
        }
    }

    return winners
}
