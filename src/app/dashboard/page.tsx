'use client'

import { useState, useEffect, useCallback } from 'react'
import NavBar from '@/components/NavBar'
import type { PopularNumber, WinnerEntry, Round, PayoutRates } from '@/lib/types'

function RateField({
    label, value, onChange,
}: { label: string; value: number; onChange: (v: number) => void }) {
    return (
        <div className="flex items-center justify-between gap-3">
            <span className="text-base text-gray-300">{label}</span>
            <div className="flex items-center gap-2">
                <input
                    type="number"
                    min={1}
                    inputMode="numeric"
                    value={value}
                    onChange={(e) => onChange(Number(e.target.value) || 1)}
                    className="w-24 rounded-xl border-2 border-gray-700 bg-gray-800 text-white
                     text-center text-xl font-bold py-2 focus:outline-none focus:border-yellow-400"
                />
                <span className="text-gray-400 text-sm">บาท/บาท</span>
            </div>
        </div>
    )
}

export default function DashboardPage() {
    const [round, setRound] = useState<Round | null>(null)
    const [popular, setPopular] = useState<PopularNumber[]>([])
    const [winners, setWinners] = useState<WinnerEntry[]>([])
    const [rates, setRates] = useState<PayoutRates | null>(null)
    const [newRoundLabel, setNewRoundLabel] = useState('')

    // Result inputs
    const [result6, setResult6] = useState('')
    const [twoTail, setTwoTail] = useState('')
    const [threeTail, setThreeTail] = useState('')

    const [savingResult, setSavingResult] = useState(false)
    const [savingRates, setSavingRates] = useState(false)
    const [resultMsg, setResultMsg] = useState('')
    const [rateMsg, setRateMsg] = useState('')
    const [loading, setLoading] = useState(true)

    const fetchDashboard = useCallback(async (rid: string) => {
        const res = await fetch(`/api/dashboard?round_id=${rid}`)
        const data = await res.json()
        setPopular(data.popular || [])
        setWinners(data.winners || [])
        setRates(data.rates)
        if (data.round?.result_6digit) setResult6(data.round.result_6digit)
        if (data.round?.two_tail) setTwoTail(data.round.two_tail)
        if (data.round?.three_tail) setThreeTail(data.round.three_tail)
    }, [])

    useEffect(() => {
        fetch('/api/rounds')
            .then((r) => r.json())
            .then((d) => {
                setRound(d.round)
                setLoading(false)
                if (d.round) fetchDashboard(d.round.id)
            })
            .catch(() => setLoading(false))
    }, [fetchDashboard])

    const handleSaveResult = async () => {
        if (!round) return
        if (result6.length !== 6) { setResultMsg('กรุณากรอกผลรางวัล 6 หลักให้ครบ'); return }
        setSavingResult(true)
        setResultMsg('')
        const auto2 = result6.slice(-2)
        const auto3 = result6.slice(-3)
        const res = await fetch('/api/rounds', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: round.id,
                result_6digit: result6,
                two_tail: twoTail || auto2,
                three_tail: threeTail || auto3,
            }),
        })
        const data = await res.json()
        if (res.ok) {
            setRound(data.round)
            setTwoTail(data.round.two_tail)
            setThreeTail(data.round.three_tail)
            setResultMsg('✅ บันทึกผลสำเร็จ!')
            fetchDashboard(round.id)
        } else {
            setResultMsg('❌ ' + data.error)
        }
        setSavingResult(false)
    }

    const handleSaveRates = async () => {
        if (!rates) return
        setSavingRates(true)
        setRateMsg('')
        const res = await fetch('/api/payout', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(rates),
        })
        const data = await res.json()
        if (res.ok) {
            setRates(data.rates)
            setRateMsg('✅ บันทึกอัตราจ่ายสำเร็จ!')
        } else {
            setRateMsg('❌ ' + data.error)
        }
        setSavingRates(false)
    }

    const handleNewRound = async () => {
        if (!newRoundLabel.trim()) return
        const res = await fetch('/api/rounds', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ label: newRoundLabel.trim() }),
        })
        const data = await res.json()
        if (res.ok) {
            setRound(data.round)
            setNewRoundLabel('')
            setPopular([])
            setWinners([])
            setResult6('')
            setTwoTail('')
            setThreeTail('')
            fetchDashboard(data.round.id)
        }
    }

    const handleCloseRound = async () => {
        if (!round || !confirm('ปิดงวดนี้?')) return
        const res = await fetch('/api/rounds', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: round.id, is_closed: true }),
        })
        const data = await res.json()
        if (res.ok) setRound(data.round)
    }

    // Total per number
    const maxCount = popular[0]?.total_count || 1

    // Group winners by type
    const winnerGroups: Record<string, WinnerEntry[]> = {}
    for (const w of winners) {
        if (!winnerGroups[w.type]) winnerGroups[w.type] = []
        winnerGroups[w.type].push(w)
    }

    const totalPrize = winners.reduce((s, w) => s + w.prize, 0)

    return (
        <>
            <NavBar />
            <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">

                {/* Round Info */}
                <div className="card p-4 space-y-3">
                    <div className="section-header">🎫 งวดปัจจุบัน</div>
                    {loading ? (
                        <div className="text-gray-400 text-center py-4">⏳ กำลังโหลด...</div>
                    ) : round ? (
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-2xl font-bold text-yellow-400">{round.label}</div>
                                <div className="text-sm text-gray-400">
                                    {round.is_closed ? '🔒 ปิดรับแล้ว' : '🟢 กำลังรับอยู่'} · {popular.reduce((s, p) => s + p.total_count, 0)} รายการ
                                </div>
                            </div>
                            {!round.is_closed && (
                                <button onClick={handleCloseRound} className="btn-red py-2 px-4 text-sm">
                                    🔒 ปิดงวด
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="text-gray-400">ยังไม่มีงวดที่เปิดอยู่</div>
                    )}

                    {/* New round */}
                    <div className="border-t border-gray-800 pt-3">
                        <div className="text-sm text-gray-400 mb-2">เปิดงวดใหม่</div>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newRoundLabel}
                                onChange={(e) => setNewRoundLabel(e.target.value)}
                                placeholder="เช่น งวด 16 มีนาคม 2568"
                                className="flex-1 rounded-xl border border-gray-700 bg-gray-800 text-white px-3 py-2 text-base focus:outline-none focus:border-yellow-400"
                            />
                            <button onClick={handleNewRound} className="btn-gold py-2 px-4 text-base">
                                + เปิดงวด
                            </button>
                        </div>
                    </div>
                </div>

                {/* Enter Result */}
                <div className="card p-4 space-y-4">
                    <div className="section-header">🎯 กรอกผลรางวัล</div>

                    <div>
                        <label className="block text-gray-400 text-sm mb-1">รางวัลที่ 1 (6 หลัก)</label>
                        <input
                            type="text"
                            inputMode="numeric"
                            maxLength={6}
                            value={result6}
                            onChange={(e) => {
                                const v = e.target.value.replace(/\D/g, '').slice(0, 6)
                                setResult6(v)
                                if (v.length === 6) {
                                    setTwoTail(v.slice(-2))
                                    setThreeTail(v.slice(-3))
                                }
                            }}
                            placeholder="xxxxxx"
                            className="input-field text-4xl tracking-widest"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-gray-400 text-sm mb-1">2 ตัวท้าย</label>
                            <input
                                type="text"
                                inputMode="numeric"
                                maxLength={2}
                                value={twoTail}
                                onChange={(e) => setTwoTail(e.target.value.replace(/\D/g, '').slice(0, 2))}
                                placeholder="xx"
                                className="input-field text-4xl tracking-widest"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-400 text-sm mb-1">3 ตัวท้าย</label>
                            <input
                                type="text"
                                inputMode="numeric"
                                maxLength={3}
                                value={threeTail}
                                onChange={(e) => setThreeTail(e.target.value.replace(/\D/g, '').slice(0, 3))}
                                placeholder="xxx"
                                className="input-field text-4xl tracking-widest"
                            />
                        </div>
                    </div>

                    {resultMsg && (
                        <div className={`rounded-xl px-4 py-3 text-center text-base font-bold ${resultMsg.startsWith('✅') ? 'bg-green-950 text-green-400 border border-green-700' : 'bg-red-950 text-red-400 border border-red-700'
                            }`}>
                            {resultMsg}
                        </div>
                    )}

                    <button
                        onClick={handleSaveResult}
                        disabled={savingResult || !round}
                        className={`btn-gold w-full py-4 text-xl ${savingResult || !round ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {savingResult ? '⏳ กำลังบันทึก...' : '💾 บันทึกผลรางวัล'}
                    </button>
                </div>

                {/* Winners */}
                {winners.length > 0 && (
                    <div className="card p-4 space-y-3">
                        <div className="section-header justify-between">
                            <span>🏆 ผู้ถูกรางวัล</span>
                            <span className="text-red-400 text-base">จ่ายรวม {totalPrize.toLocaleString()} ฿</span>
                        </div>

                        {Object.entries(winnerGroups).map(([type, ws]) => {
                            const groupTotal = ws.reduce((s, w) => s + w.prize, 0)
                            return (
                                <div key={type} className="bg-gray-800 rounded-2xl p-3 space-y-2">
                                    <div className="flex justify-between items-center border-b border-gray-700 pb-2">
                                        <span className="text-yellow-400 font-bold text-lg">{type}</span>
                                        <span className="text-red-400 text-sm font-bold">รวม {groupTotal.toLocaleString()} ฿</span>
                                    </div>
                                    {ws.map((w, i) => (
                                        <div key={i} className="flex justify-between items-center">
                                            <div>
                                                <span className="text-white font-bold text-lg">{w.buyer_name}</span>
                                                <span className="text-gray-400 text-sm ml-2">(แทง {w.bet_amount} ฿)</span>
                                            </div>
                                            <span className="text-green-400 font-extrabold text-xl">
                                                {w.prize.toLocaleString()} ฿
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )
                        })}
                    </div>
                )}

                {/* Popular numbers */}
                <div className="card p-4 space-y-3">
                    <div className="section-header">🔥 เลขยอดนิยม (Top 20)</div>
                    {popular.length === 0 ? (
                        <div className="text-gray-500 text-center py-6">ยังไม่มีรายการแทง</div>
                    ) : (
                        <div className="space-y-2">
                            {popular.map((p, i) => {
                                const barPct = Math.max(8, (p.total_count / maxCount) * 100)
                                const totalMoney = p.total_top + p.total_bottom
                                return (
                                    <div key={p.number} className="flex flex-col gap-1 mb-2">
                                        <div className="flex items-center gap-3">
                                            <span className="text-gray-500 text-sm w-5 text-right">{i + 1}</span>
                                            <span className="text-yellow-400 font-extrabold text-xl w-12 text-center">
                                                {p.number}
                                            </span>
                                            <div className="flex-1 rounded-full bg-gray-800 h-8 relative overflow-hidden">
                                                <div
                                                    className="absolute left-0 top-0 h-full rounded-full transition-all duration-500"
                                                    style={{
                                                        width: `${barPct}%`,
                                                        background: 'linear-gradient(90deg, #f5c842, #e68917)',
                                                    }}
                                                />
                                                <span className="absolute inset-0 flex items-center px-3 text-sm font-bold text-gray-900 z-10">
                                                    {p.total_count} ราย · {totalMoney.toLocaleString()} ฿
                                                </span>
                                            </div>
                                            <div className="text-xs text-gray-500 w-12 text-right">
                                                {p.number.length === 2 ? '2 ตัว' : '3 ตัว'}
                                            </div>
                                        </div>
                                        {p.buyers && p.buyers.length > 0 && (
                                            <div className="pl-[5.5rem] pr-12 text-xs text-gray-400 leading-relaxed truncate">
                                                👤 {p.buyers.join(', ')}
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>

                {/* Payout Rates */}
                {rates && (
                    <div className="card p-4 space-y-4">
                        <div className="section-header">⚙️ ตั้งค่าอัตราจ่าย</div>
                        <RateField
                            label="2 ตัวบน"
                            value={rates.two_digit_top}
                            onChange={(v) => setRates({ ...rates, two_digit_top: v })}
                        />
                        <RateField
                            label="2 ตัวล่าง"
                            value={rates.two_digit_bottom}
                            onChange={(v) => setRates({ ...rates, two_digit_bottom: v })}
                        />
                        <RateField
                            label="3 ตัวบน"
                            value={rates.three_digit_top}
                            onChange={(v) => setRates({ ...rates, three_digit_top: v })}
                        />
                        <RateField
                            label="3 ตัวล่าง"
                            value={rates.three_digit_bottom}
                            onChange={(v) => setRates({ ...rates, three_digit_bottom: v })}
                        />

                        {rateMsg && (
                            <div className={`rounded-xl px-4 py-3 text-center text-base font-bold ${rateMsg.startsWith('✅') ? 'bg-green-950 text-green-400 border border-green-700' : 'bg-red-950 text-red-400 border border-red-700'
                                }`}>
                                {rateMsg}
                            </div>
                        )}

                        <button
                            onClick={handleSaveRates}
                            disabled={savingRates}
                            className={`btn-green w-full py-4 text-xl ${savingRates ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {savingRates ? '⏳ กำลังบันทึก...' : '💾 บันทึกอัตราจ่าย'}
                        </button>
                    </div>
                )}

            </main>
        </>
    )
}
