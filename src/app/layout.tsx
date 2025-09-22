import "./globals.css";
import Navbar from "@/components/Navbar";
import { Toaster } from "@/components/ui/use-toast";

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
        <Toaster>
          <Navbar />
          <main className="min-h-screen">{children}</main>
        </Toaster>
      </body>
    </html>
  );
}
