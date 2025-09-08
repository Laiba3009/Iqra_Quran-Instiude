import './globals.css'
import Navbar from '@/components/Navbar'

export const metadata = {
  title: "iqra online quran institute",
  description: "Best School System",
  icons: {
    icon: "/images/logo.png",       // normal favicon
    shortcut: "/images/logo.png",   // browser shortcut
    apple: "/images/logo.png",      // Apple devices
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
      </body>
    </html>
  )
}
