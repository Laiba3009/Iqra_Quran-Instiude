import './globals.css';
import Navbar from '@/components/Navbar';

export const metadata = {
  title: "Iqra Online Quran Institute",
  description: "Best School System",
  icons: {
    icon: "/images/logo.png",
    shortcut: "/images/logo.png",
    apple: "/images/logo.png",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50">
        <Navbar />
        <main className="max-w-6xl mx-auto px-4 py-6 mt-16">{children}</main>
      </body>
    </html>
  );
}
