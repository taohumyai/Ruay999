'use client'

import { useState, useEffect } from 'react'
import NavBar from '@/components/NavBar'
import { BetForm, BetSlipList } from '@/components/BetSlip'
import type { BetEntry, Round } from '@/lib/types'

const EMPTY_ENTRY: BetEntry = { number: '', top_amount: 0, bottom_amount: 0 }

function reverseNumber(n: string): string {
    return n.split('').reverse().join('')
}

export default function BetPage() {
    const [currentRound, setCurrentRound] = useState<Round | null>(null)
    const [currentEntry, setCurrentEntry] = useState<BetEntry>(EMPTY_ENTRY)
    const [entries, setEntries] = useState<BetEntry[]>([])
    const [buyerName, setBuyerName] = useState('')
    const [reverseMode, setReverseMode] = useState(false)
    const [loading, setLoading] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const [error, setError] = useState('')

    useEffect(() => {
        fetch('/api/rounds').then(r => r.json()).then(d => setCurrentRound(d.round))
    }, [])

    const handleAdd = () => {
        if (currentEntry.number.length < 2) return
        if (currentEntry.top_amount === 0 && currentEntry.bottom_amount === 0) return

        const newEntries: BetEntry[] = [{ ...currentEntry }]

        // กลับเลข 2 ตัว
        if (reverseMode && currentEntry.number.length === 2) {
            const rev = reverseNumber(currentEntry.number)
            // Don't add duplicate if number is palindrome (e.g. 11, 22)
            if (rev !== currentEntry.number) {
                newEntries.push({ ...currentEntry, number: rev })
            }
        }

        setEntries([...entries, ...newEntries])
        setCurrentEntry(EMPTY_ENTRY)
        // Keep reverseMode as-is so user doesn't have to toggle again
    }

    const handleRemove = (i: number) => {
        setEntries(entries.filter((_, idx) => idx !== i))
    }

    const handleSubmit = async () => {
        if (!buyerName.trim()) { setError('กรุณาใส่ชื่อก่อนส่งโพยครับ'); return }
        if (entries.length === 0) { setError('ยังไม่มีเลขในโพย'); return }
        if (!currentRound) { setError('ยังไม่มีงวดที่เปิดรับ'); return }

        setLoading(true)
        setError('')
        try {
            const res = await fetch('/api/bets', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    round_id: currentRound.id,
                    buyer_name: buyerName.trim(),
                    entries,
                }),
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'เกิดข้อผิดพลาด')
            setSubmitted(true)
            setEntries([])
            setBuyerName('')
            setCurrentEntry(EMPTY_ENTRY)
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : 'เกิดข้อผิดพลาด กรุณาลองใหม่')
        } finally {
            setLoading(false)
        }
    }

    const totalAmount = entries.reduce((s, e) => s + e.top_amount + e.bottom_amount, 0)

    return (
        <>
            <NavBar />
            <main className="max-w-lg mx-auto px-4 py-6 space-y-5">

                {/* Round banner */}
                <div className="card p-4 flex items-center justify-between">
                    <div>
                        <div className="text-base text-gray-400 font-bold">งวดปัจจุบัน</div>
                        <div className="text-2xl font-extrabold text-yellow-300">
                            {currentRound ? currentRound.label : '⏳ กำลังโหลด...'}
                        </div>
                    </div>
                    <div className="text-4xl">🎫</div>
                </div>

                {/* Success */}
                {submitted && (
                    <div className="card border-green-600 bg-green-900 p-5 text-center">
                        <div className="text-5xl mb-2">🎉</div>
                        <div className="text-3xl font-extrabold text-green-300">ส่งโพยสำเร็จ!</div>
                        <div className="text-gray-200 mt-2 text-lg">บันทึกเรียบร้อยแล้วครับ</div>
                        <button
                            onClick={() => setSubmitted(false)}
                            className="btn-gold py-3 px-8 mt-5 text-xl mx-auto"
                        >
                            ✏️ ลงโพยใหม่
                        </button>
                    </div>
                )}

                {!submitted && (
                    <>
                        <BetForm
                            entry={currentEntry}
                            onChange={setCurrentEntry}
                            onAdd={handleAdd}
                            reverseMode={reverseMode}
                            onToggleReverse={() => setReverseMode(!reverseMode)}
                        />

                        <BetSlipList entries={entries} onRemove={handleRemove} />

                        {/* Name + Submit */}
                        {entries.length > 0 && (
                            <div className="card p-4 space-y-4">
                                <div className="section-header">👤 ชื่อผู้ส่งโพย</div>
                                <input
                                    type="text"
                                    value={buyerName}
                                    onChange={(e) => setBuyerName(e.target.value)}
                                    placeholder="พิมพ์ชื่อที่นี่..."
                                    className="input-field text-2xl"
                                />

                                {error && (
                                    <div className="bg-red-900 border border-red-600 rounded-xl px-4 py-3 text-red-200 text-center text-lg font-bold">
                                        ⚠️ {error}
                                    </div>
                                )}

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => { setEntries([]); setCurrentEntry(EMPTY_ENTRY) }}
                                        className="btn-ghost py-4 text-xl flex-1"
                                    >
                                        🗑️ ล้างทั้งหมด
                                    </button>
                                    <button
                                        onClick={handleSubmit}
                                        disabled={loading}
                                        className={`btn-gold py-4 text-xl flex-1 ${loading ? 'opacity-60 cursor-not-allowed' : ''}`}
                                    >
                                        {loading ? '⏳ รอสักครู่...' : `📤 ส่งโพย (${totalAmount.toLocaleString()} ฿)`}
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </main>
        </>
    )
}
