import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AI Nutrition Assistant',
  description: 'Your smart nutrition assistant'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="h-full bg-[#212121] text-white">
        <div className="flex h-full">
          {children}
        </div>
      </body>
    </html>
  )
}
