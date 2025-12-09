import "./globals.css";
import { Toaster } from "@/components/ui/use-toast";
import Footer from "@/components/Footer";
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
        {/* ✅ Wrap the app content with your custom Toaster */}
        <Toaster>
          {/* Optional Navbar/Header */}
          {/* <Navbar /> */}
          <main className="min-h-screen">{children}</main>
          <Footer />
        </Toaster>
      </body>
    </html>
  );
}
