'use client'

import { useState } from 'react'
import NumberPad from './NumberPad'
import type { BetEntry } from '@/lib/types'

type PadTarget = 'number' | 'top' | 'bottom' | null

interface BetFormProps {
    entry: BetEntry
    onChange: (e: BetEntry) => void
    onAdd: () => void
    reverseMode: boolean
    onToggleReverse: () => void
}

export function BetForm({ entry, onChange, onAdd, reverseMode, onToggleReverse }: BetFormProps) {
    const [padTarget, setPadTarget] = useState<PadTarget>(null)

    const canAdd = entry.number.length >= 2 && (entry.top_amount > 0 || entry.bottom_amount > 0)
    const is2digit = entry.number.length === 2
    const reversed = entry.number.length === 2
        ? entry.number[1] + entry.number[0]
        : ''

    const handlePadConfirm = (val: string) => {
        if (padTarget === 'number') {
            onChange({ ...entry, number: val })
        } else if (padTarget === 'top') {
            onChange({ ...entry, top_amount: Number(val) })
        } else if (padTarget === 'bottom') {
            onChange({ ...entry, bottom_amount: Number(val) })
        }
    }

    return (
        <>
            <div className="card p-4 space-y-5">
                {/* Number selector */}
                <div>
                    <div className="section-header mb-3">🔢 เลขที่แทง</div>
                    <button
                        onClick={() => setPadTarget('number')}
                        className="w-full rounded-2xl border-2 border-dashed border-yellow-400 bg-gray-800
                       flex items-center justify-center py-6 active:scale-95 transition-all"
                    >
                        {entry.number ? (
                            <div className="text-center">
                                <span className="text-6xl font-extrabold text-yellow-300 tracking-widest">
                                    {entry.number}
                                </span>
                                <div className="text-base text-gray-300 mt-1 font-bold">
                                    {entry.number.length === 2 ? '2 ตัว' : '3 ตัว'}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center">
                                <div className="text-5xl mb-1">🎯</div>
                                <div className="text-2xl text-gray-300 font-extrabold">แตะเพื่อใส่เลข</div>
                                <div className="text-base text-gray-400 mt-1">2 ตัว หรือ 3 ตัว</div>
                            </div>
                        )}
                    </button>
                </div>

                {/* Reverse toggle — only for 2-digit */}
                {is2digit && (
                    <button
                        onClick={onToggleReverse}
                        className={`w-full py-4 rounded-2xl border-2 text-xl font-extrabold transition-all active:scale-95 flex items-center justify-center gap-3 ${reverseMode
                                ? 'bg-blue-600 border-blue-400 text-white'
                                : 'bg-gray-800 border-gray-600 text-gray-300 hover:border-blue-400'
                            }`}
                    >
                        <span className="text-2xl">🔄</span>
                        <div className="text-left">
                            <div>กลับเลข 2 ตัว</div>
                            {reverseMode && entry.number.length === 2 && (
                                <div className="text-sm font-bold text-blue-200">
                                    จะเพิ่ม {entry.number} + {reversed}
                                </div>
                            )}
                            {!reverseMode && (
                                <div className="text-sm text-gray-500">แตะเพื่อเปิดใช้</div>
                            )}
                        </div>
                        <div className={`ml-auto w-12 h-7 rounded-full border-2 relative transition-all ${reverseMode ? 'bg-blue-500 border-blue-300' : 'bg-gray-700 border-gray-600'
                            }`}>
                            <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${reverseMode ? 'left-5' : 'left-0.5'
                                }`} />
                        </div>
                    </button>
                )}

                {/* Amount inputs — tap to open NumPad */}
                <div>
                    <div className="section-header mb-3">💰 จำนวนเงิน (บาท)</div>
                    <div className="grid grid-cols-2 gap-3">
                        {/* บน */}
                        <div>
                            <div className="field-label">บน 📈</div>
                            <button
                                onClick={() => setPadTarget('top')}
                                className={`amount-tap w-full ${entry.top_amount === 0 ? '' : 'border-yellow-500'}`}
                            >
                                {entry.top_amount > 0 ? (
                                    <span className="text-yellow-300">{entry.top_amount}</span>
                                ) : (
                                    <span className="amount-tap-empty">แตะใส่เงิน</span>
                                )}
                            </button>
                        </div>
                        {/* ล่าง */}
                        <div>
                            <div className="field-label">ล่าง 📉</div>
                            <button
                                onClick={() => setPadTarget('bottom')}
                                className={`amount-tap w-full ${entry.bottom_amount === 0 ? '' : 'border-yellow-500'}`}
                            >
                                {entry.bottom_amount > 0 ? (
                                    <span className="text-yellow-300">{entry.bottom_amount}</span>
                                ) : (
                                    <span className="amount-tap-empty">แตะใส่เงิน</span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Add button */}
                <button
                    onClick={onAdd}
                    disabled={!canAdd}
                    className={`btn-gold w-full py-5 text-2xl ${!canAdd ? 'opacity-40 cursor-not-allowed' : ''}`}
                >
                    ➕ เพิ่มเลขนี้{reverseMode && is2digit ? ` + ${reversed}` : ''}
                </button>
            </div>

            {/* NumPad bottom sheet */}
            {padTarget && (
                <NumberPad
                    value={
                        padTarget === 'number'
                            ? entry.number
                            : padTarget === 'top'
                                ? entry.top_amount > 0 ? String(entry.top_amount) : ''
                                : entry.bottom_amount > 0 ? String(entry.bottom_amount) : ''
                    }
                    mode={padTarget === 'number' ? 'lottery' : 'amount'}
                    title={
                        padTarget === 'number'
                            ? '🔢 เลือกตัวเลข'
                            : padTarget === 'top'
                                ? '💰 ใส่เงินบน'
                                : '💰 ใส่เงินล่าง'
                    }
                    onChange={handlePadConfirm}
                    onClose={() => setPadTarget(null)}
                />
            )}
        </>
    )
}

interface BetSlipListProps {
    entries: BetEntry[]
    onRemove: (index: number) => void
}

export function BetSlipList({ entries, onRemove }: BetSlipListProps) {
    if (entries.length === 0) return null
    const total = entries.reduce((s, e) => s + e.top_amount + e.bottom_amount, 0)

    return (
        <div className="card p-4 space-y-3">
            <div className="section-header justify-between">
                <span>📋 รายการโพย ({entries.length} รายการ)</span>
                <span className="text-yellow-200 text-base font-extrabold">รวม {total.toLocaleString()} ฿</span>
            </div>

            {entries.map((e, i) => (
                <div key={i} className="slip-row">
                    <div className="flex items-center gap-3">
                        <span className="text-4xl font-extrabold text-yellow-300 w-14 text-center tracking-wider">
                            {e.number}
                        </span>
                        <div>
                            <div className="text-base font-bold text-gray-200">
                                {e.number.length === 2 ? '2 ตัว' : '3 ตัว'}
                            </div>
                            <div className="text-sm text-gray-400">
                                {e.top_amount > 0 && `บน ${e.top_amount} ฿`}
                                {e.top_amount > 0 && e.bottom_amount > 0 && '  '}
                                {e.bottom_amount > 0 && `ล่าง ${e.bottom_amount} ฿`}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xl font-extrabold text-white">
                            {(e.top_amount + e.bottom_amount).toLocaleString()} ฿
                        </span>
                        <button
                            onClick={() => onRemove(i)}
                            className="w-10 h-10 rounded-xl bg-red-800 text-white flex items-center justify-center
                         active:scale-95 hover:bg-red-600 text-xl font-bold"
                        >
                            ✕
                        </button>
                    </div>
                </div>
            ))}
        </div>
    )
}
