import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
    title: 'รวยเด้อสาธุ 🍀',
    description: 'ระบบรับแทงหวย ลงโพยง่าย สรุปผลชัดเจน',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="th">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link
                    href="https://fonts.googleapis.com/css2?family=Sarabun:wght@400;600;700;800&display=swap"
                    rel="stylesheet"
                />
            </head>
            <body className="bg-gray-950 text-white font-sarabun min-h-screen">
                {children}
            </body>
        </html>
    )
}
