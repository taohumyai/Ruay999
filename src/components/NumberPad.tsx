'use client'

import { useState, useEffect } from 'react'

interface NumberPadProps {
    value: string
    onChange: (val: string) => void
    onClose: () => void
    mode?: 'lottery' | 'amount'   // lottery = 2-3 digits, amount = free money entry
    title?: string
}

export default function NumberPad({
    value,
    onChange,
    onClose,
    mode = 'lottery',
    title,
}: NumberPadProps) {
    const [local, setLocal] = useState(value)

    useEffect(() => { setLocal(value) }, [value])

    const maxDigits = mode === 'amount' ? 6 : 3

    const press = (digit: string) => {
        // Don't allow leading zero for amounts
        if (mode === 'amount' && local === '' && digit === '0') return
        if (local.length < maxDigits) {
            setLocal(local + digit)
        }
    }

    const backspace = () => setLocal(local.slice(0, -1))
    const clear = () => setLocal('')

    const canConfirm =
        mode === 'lottery' ? local.length >= 2 : local.length >= 1

    const confirm = () => {
        if (!canConfirm) return
        onChange(local)
        onClose()
    }

    // Amount presets
    const amountPresets = [10, 20, 50, 100, 200, 500]

    const digits = ['7', '8', '9', '4', '5', '6', '1', '2', '3']

    // Hint text for lottery mode
    const hint =
        mode === 'lottery'
            ? local.length === 0
                ? 'กด 2 หลัก = 2 ตัว  |  กด 3 หลัก = 3 ตัว'
                : local.length === 1
                    ? 'ต้องการอย่างน้อย 2 หลัก'
                    : local.length === 2
                        ? '✓ 2 ตัว — กด OK หรือกดต่อเพื่อ 3 ตัว'
                        : '✓ 3 ตัว — กด OK เพื่อยืนยัน'
            : ''

    return (
        <div
            className="fixed inset-0 z-50 flex items-end justify-center"
            onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black bg-opacity-75" />

            {/* Panel */}
            <div className="relative w-full max-w-sm bg-gray-900 rounded-t-3xl border-t-2 border-gray-600 p-5 pb-8 shadow-2xl animate-slide-up">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-extrabold text-yellow-300">
                        {title ?? (mode === 'lottery' ? 'เลือกตัวเลข' : 'ใส่จำนวนเงิน')}
                    </span>
                    <button onClick={onClose} className="text-gray-400 text-3xl leading-none hover:text-white">×</button>
                </div>

                {/* Display */}
                <div className="flex items-center justify-center mb-3 rounded-2xl bg-gray-800 border-2 border-gray-600 py-4 min-h-[80px]">
                    {local ? (
                        <span className="text-5xl font-extrabold tracking-widest text-yellow-300">
                            {local}{mode === 'amount' && <span className="text-2xl text-gray-400 ml-1">฿</span>}
                        </span>
                    ) : (
                        <span className="text-3xl text-gray-600 font-bold">
                            {mode === 'amount' ? '0 ฿' : '- -'}
                        </span>
                    )}
                </div>

                {/* Hint */}
                {hint && (
                    <div className="text-center text-base text-gray-400 mb-3 font-medium">{hint}</div>
                )}

                {/* Amount presets */}
                {mode === 'amount' && (
                    <div className="grid grid-cols-6 gap-2 mb-3">
                        {amountPresets.map((p) => (
                            <button
                                key={p}
                                onClick={() => { setLocal(String(p)) }}
                                className={`rounded-xl py-2 text-base font-extrabold border-2 transition-all active:scale-95 ${local === String(p)
                                        ? 'bg-yellow-400 text-gray-900 border-yellow-400'
                                        : 'bg-gray-700 text-white border-gray-600 hover:border-yellow-400'
                                    }`}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                )}

                {/* Numpad Grid */}
                <div className="grid grid-cols-3 gap-3">
                    {digits.map((d) => (
                        <button key={d} className="numpad-btn" onClick={() => press(d)}>
                            {d}
                        </button>
                    ))}
                    <button className="numpad-btn-special text-lg font-bold" onClick={clear}>ล้าง</button>
                    <button className="numpad-btn" onClick={() => press('0')}>0</button>
                    <button className="numpad-btn-special text-3xl" onClick={backspace}>⌫</button>
                </div>

                {/* Confirm / Cancel */}
                <div className="grid grid-cols-2 gap-3 mt-4">
                    <button className="btn-ghost py-4 text-xl" onClick={onClose}>
                        ยกเลิก
                    </button>
                    <button
                        className={`numpad-btn-enter py-4 text-xl font-extrabold ${!canConfirm ? 'opacity-40 cursor-not-allowed' : ''
                            }`}
                        onClick={confirm}
                        disabled={!canConfirm}
                    >
                        ✓ ตกลง
                    </button>
                </div>
            </div>

            <style jsx>{`
        @keyframes slide-up {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .animate-slide-up { animation: slide-up 0.25s ease-out; }
      `}</style>
        </div>
    )
}
