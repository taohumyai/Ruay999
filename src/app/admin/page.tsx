'use client'

import { useState, useEffect, useCallback } from 'react'
import NavBar from '@/components/NavBar'
import type { Bet, Round } from '@/lib/types'

export default function AdminPage() {
    const [round, setRound] = useState<Round | null>(null)
    const [bets, setBets] = useState<Bet[]>([])
    const [loading, setLoading] = useState(true)

    const fetchBets = useCallback(async (rid: string) => {
        const res = await fetch(`/api/bets?round_id=${rid}`)
        const data = await res.json()
        // Sort newest first
        const sorted = (data.bets || []).sort(
            (a: Bet, b: Bet) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
        setBets(sorted)
    }, [])

    useEffect(() => {
        fetch('/api/rounds')
            .then((r) => r.json())
            .then((d) => {
                setRound(d.round)
                if (d.round) fetchBets(d.round.id)
                else setLoading(false)
            })
            .catch(() => setLoading(false))
    }, [fetchBets])

    useEffect(() => {
        if (round && bets) setLoading(false)
    }, [round, bets])

    const handleDelete = async (id: string, number: string, name: string) => {
        if (!confirm(`ยืนยันการลบรายการ: เลข ${number} ของคุณ ${name}?`)) return

        try {
            const res = await fetch(`/api/bets?id=${id}`, {
                method: 'DELETE',
            })
            if (!res.ok) throw new Error('Delete failed')
            // Update state without refetching all
            setBets(bets.filter((b) => b.id !== id))
        } catch (err) {
            alert('เกิดข้อผิดพลาดในการลบ กรุณาลองใหม่')
        }
    }

    // Calculate totals
    const totalMoney = bets.reduce((s, b) => s + b.top_amount + b.bottom_amount, 0)

    return (
        <>
            <NavBar />
            <main className="max-w-4xl mx-auto px-4 py-6 space-y-6">

                {/* Header */}
                <div className="card p-5 flex items-center justify-between">
                    <div>
                        <div className="text-xl font-bold text-yellow-300">⚙️ จัดการโพย (Admin)</div>
                        <div className="text-gray-400 mt-1">
                            {round ? `งวด: ${round.label}` : 'กำลังโหลด...'}
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-sm text-gray-400">ยอดรวมทั้งหมด</div>
                        <div className="text-2xl font-extrabold text-green-400">
                            {totalMoney.toLocaleString()} ฿
                        </div>
                    </div>
                </div>

                {/* List */}
                <div className="card p-4">
                    <div className="flex justify-between items-center mb-4">
                        <div className="section-header">📋 รายการทั้งหมด ({bets.length})</div>
                    </div>

                    {loading ? (
                        <div className="text-center text-gray-500 py-10">⏳ กำลังโหลดข้อมูล...</div>
                    ) : bets.length === 0 ? (
                        <div className="text-center text-gray-500 py-10">ย้งไม่มีรายการแทงในงวดนี้</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="border-b-2 border-gray-700 text-gray-400 text-sm">
                                        <th className="py-3 px-2">เวลา</th>
                                        <th className="py-3 px-2">ชื่อผู้แทง</th>
                                        <th className="py-3 px-2 text-center">ตัวเลข</th>
                                        <th className="py-3 px-2 text-right">บน</th>
                                        <th className="py-3 px-2 text-right">ล่าง</th>
                                        <th className="py-3 px-2 text-right">รวม</th>
                                        <th className="py-3 px-2 text-center">จัดการ</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-800">
                                    {bets.map((b) => {
                                        const time = new Date(b.created_at).toLocaleTimeString('th-TH', {
                                            hour: '2-digit', minute: '2-digit'
                                        })
                                        const total = b.top_amount + b.bottom_amount
                                        return (
                                            <tr key={b.id} className="hover:bg-gray-800 transition-colors">
                                                <td className="py-3 px-2 text-gray-500 text-sm">{time}</td>
                                                <td className="py-3 px-2 font-bold text-white">{b.buyer_name}</td>
                                                <td className="py-3 px-2 text-center">
                                                    <span className="text-xl font-extrabold text-yellow-300 bg-gray-900 px-3 py-1 rounded-lg border border-gray-700">
                                                        {b.number}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-2 text-right text-gray-300">
                                                    {b.top_amount > 0 ? b.top_amount.toLocaleString() : '-'}
                                                </td>
                                                <td className="py-3 px-2 text-right text-gray-300">
                                                    {b.bottom_amount > 0 ? b.bottom_amount.toLocaleString() : '-'}
                                                </td>
                                                <td className="py-3 px-2 text-right font-bold text-green-400">
                                                    {total.toLocaleString()}
                                                </td>
                                                <td className="py-3 px-2 text-center">
                                                    <button
                                                        onClick={() => handleDelete(b.id, b.number, b.buyer_name)}
                                                        className="text-red-500 hover:text-white hover:bg-red-600 px-3 py-1 rounded-lg border border-red-900 transition-all font-bold"
                                                    >
                                                        ลบ
                                                    </button>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

            </main>
        </>
    )
}
