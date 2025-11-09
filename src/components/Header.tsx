"use client";

import { Menu } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface HeaderProps {
  toggleSidebar: () => void;
}

export default function Header({ toggleSidebar }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 w-full bg-white shadow z-50 flex items-center justify-between px-6 py-3">
      {/* Left Side - Logo */}
      <div className="flex items-center gap-2">
        <Image src="/images/logo.png" alt="Logo" width={40} height={40} />
        <span className="font-extrabold text-[#001F3F] text-lg sm:text-xl">
          IQRA Quran Institute
        </span>
      </div>

      {/* Right Side - Links + Menu Button */}
      <div className="flex items-center gap-6">
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/about"
            className="text-[#001F3F] font-medium hover:text-blue-600"
          >
            About
          </Link>
          <Link
            href="/admin/signin"
            className="text-[#001F3F] font-medium hover:text-blue-600"
          >
            Admin Signin
          </Link>
        </nav>

        {/* Menu Button */}
        <button
          onClick={toggleSidebar}
          className="text-[#001F3F] hover:text-blue-600"
        >
          <Menu size={28} />
        </button>
      </div>
    </header>
  );
}
