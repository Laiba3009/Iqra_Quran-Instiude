'use client';
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";

export default function SyllabusCard({ href, title, desc }: { href: string; title: string; desc: string; }) {
  return (
    <Link href={href}>
      <Card className="cursor-pointer hover:shadow-lg transition">
        <CardHeader><CardTitle>{title}</CardTitle></CardHeader>
        <CardContent><p className="text-gray-600">{desc}</p></CardContent>
      </Card>
    </Link>
  );
}