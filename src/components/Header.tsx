"use client";
import { Menu } from "lucide-react";
import Image from "next/image";

export default function Header({ toggleSidebar }: { toggleSidebar: () => void }) {
  return (
    <header className="fixed top-0 left-0 w-full bg-white shadow z-40 flex items-center justify-between px-4 py-3 md:pl-64">
      <div className="flex items-center gap-2 mx-auto md:mx-0">
        <Image src="/images/logo.png" alt="Logo" width={40} height={40} />
        <span className="font-extrabold text-[#001F3F] text-lg sm:text-xl">
          IQRA Quran Institute
        </span>
      </div>
      <button
        onClick={toggleSidebar}
        className="md:hidden absolute right-4 top-4 z-50 text-[#001F3F]"
      >
        <Menu size={28} />
      </button>
    </header>
  );
}
