'use client';
import HadithSection from "@/components/HadithSection";
import SyllabusList from "../../../../../../components/SyllabusList";

export default function GradesPage() {
  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Quran</h1>
       <HadithSection />
      <SyllabusList />
    </div>
  );
}