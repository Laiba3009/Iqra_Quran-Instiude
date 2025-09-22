'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

interface BackButtonProps {
  href: string;   // jaha back karna hai
  label?: string; // default "Back"
}

export default function BackButton({ href, label = "Back" }: BackButtonProps) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white font-medium rounded-lg shadow hover:bg-green-700 transition"
    >
      <ArrowLeft size={20} />
      {label}
    </Link>
  );
}
