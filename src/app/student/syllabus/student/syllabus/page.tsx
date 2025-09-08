'use client';
import SyllabusCard from "../../../../../components/SyllabusCard";

export default function SyllabusHome() {
  return (
    <div className="space-y-6 p-4">
      <h1 className="text-3xl font-bold">📖 Syllabus</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SyllabusCard href="/student/syllabus/student/syllabus/grades" title="📚 Grades Syllabus" desc="View syllabus for all grades" />
        <SyllabusCard href="/student/syllabus/student/syllabus/hadith" title="📖 60 Hadith" desc="Playgroup, Prep & Nursery Hadith" />
        <SyllabusCard href="/student/syllabus/student/syllabus/islamic-studies" title="🕌 Islamic Studies" desc="Imaan, Faith, Practices & A'maal" />
      </div>
    </div>
  );
}