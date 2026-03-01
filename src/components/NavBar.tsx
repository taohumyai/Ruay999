'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function NavBar() {
    const pathname = usePathname()

    return (
        <nav className="sticky top-0 z-50 bg-gray-950 border-b border-gray-800 shadow-lg">
            <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between">
                {/* Logo */}
                <div className="flex items-center gap-2">
                    <span className="text-3xl">🍀</span>
                    <div>
                        <div className="text-lg font-extrabold text-yellow-400 leading-tight">รวยเด้อสาธุ</div>
                        <div className="text-xs text-gray-400">ระบบรับแทงหวย</div>
                    </div>
                </div>

                {/* Nav Links */}
                <div className="flex gap-2">
                    <Link
                        href="/"
                        className={`px-4 py-2 rounded-xl text-lg font-bold transition-all ${pathname === '/'
                                ? 'bg-yellow-400 text-gray-900'
                                : 'text-gray-300 hover:text-white hover:bg-gray-800'
                            }`}
                    >
                        ✏️ ลงโพย
                    </Link>
                    <Link
                        href="/dashboard"
                        className={`px-4 py-2 rounded-xl text-lg font-bold transition-all ${pathname === '/dashboard'
                                ? 'bg-yellow-400 text-gray-900'
                                : 'text-gray-300 hover:text-white hover:bg-gray-800'
                            }`}
                    >
                        📊 Dashboard
                    </Link>
                </div>
            </div>
        </nav>
    )
}
