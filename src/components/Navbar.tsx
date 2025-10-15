'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const [syllabusOpen, setSyllabusOpen] = useState(false);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    // Get role from localStorage (set during login)
    const storedRole = localStorage.getItem("userRole"); 
    setRole(storedRole);
  }, []);

  // Role-based Home link
  let homeLink = "/";
  if (role === "student") homeLink = "/student/dashboard";
  else if (role === "teacher") homeLink = "/teacher/dashboard";
  else if (role === "admin") homeLink = "/admin/dashboard";

  return (
    <div className="w-full border-b bg-white shadow-sm fixed top-0 left-0 z-50">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-extrabold text-green-800 text-xl">
          <img
            src="/images/logo.png"
            alt="Logo"
            className="h-8 w-8 object-contain"
          />
          IQRA Quran Institute
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex gap-6 text-base font-medium text-gray-700 relative">
          
          {/* Syllabus Dropdown */}
         
          {/* ✅ Home Button with Role-based Redirect */}
          <Link href={homeLink} className={path === homeLink ? 'text-green-800 font-semibold' : 'hover:text-green-800'}>
            Home
          </Link>

          <Link href="/about" className={path === '/about' ? 'text-green-800 font-semibold' : 'hover:text-green-800'}>
            About
          </Link>

          <Link href="/login" className={path === '/login' ? 'text-green-800 font-semibold' : 'hover:text-green-800'}>
            Login
          </Link>
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setOpen(true)}
          className="md:hidden p-2 text-green-800"
        >
          <Menu size={28} />
        </button>
      </div>

      {/* Sidebar for Mobile */}
      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
          <div className="fixed top-0 left-0 w-64 h-full bg-white shadow-lg p-5 flex flex-col">
            
            {/* Close button */}
            <button
              onClick={() => setOpen(false)}
              className="self-end text-green-800 mb-4"
            >
              <X size={28} />
            </button>

            {/* ✅ Role-based Home Link */}
            <Link
              href={homeLink}
              className={`mb-4 ${path === homeLink ? 'text-green-800 font-semibold' : 'hover:text-green-800'}`}
              onClick={() => setOpen(false)}
            >
              Home
            </Link>

          
            <Link
              href="/about"
              className={`mb-4 ${path === '/contact' ? 'text-green-800 font-semibold' : 'hover:text-green-800'}`}
              onClick={() => setOpen(false)}
            >
              About
            </Link>

            <Link
              href="/login"
              className={`mb-4 ${path === '/login' ? 'text-green-800 font-semibold' : 'hover:text-green-800'}`}
              onClick={() => setOpen(false)}
            >
              Login
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
