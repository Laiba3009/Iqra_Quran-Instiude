"use client";

import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-[#0f1724] text-white py-3">
      <div className="max-w-6xl mx-auto px-4 flex flex-wrap items-center justify-between gap-3">

        {/* Logo & Name */}
        <div className="flex items-center space-x-2">
          <Image
            src="/images/logo1.jpg"
            alt="Institute Logo"
            width={35}
            height={35}
            className="rounded-full border border-gray-700"
          />
          <span className="font-semibold text-white text-sm md:text-base">
            Iqra Quran Institute
          </span>
        </div>

        {/* Contact */}
        <div className="text-gray-300 text-xs md:text-sm flex items-center space-x-4">
          <span>Phone: +92 300 0000000</span>
          <span>Email: support@iqrainstitute.com</span>
        </div>

        {/* Social Icons */}
        <div className="flex items-center gap-3 text-white text-sm">
          <i className="fa-brands fa-facebook-f hover:text-blue-500 cursor-pointer"></i>
          <i className="fa-brands fa-whatsapp hover:text-green-500 cursor-pointer"></i>
          <i className="fa-brands fa-youtube hover:text-red-500 cursor-pointer"></i>
        </div>

      </div>

      {/* Copyright */}
      <div className="text-center text-gray-400 text-xs mt-2">
        © {new Date().getFullYear()} Iqra Quran Institute — All Rights Reserved.
      </div>
    </footer>
  );
}
