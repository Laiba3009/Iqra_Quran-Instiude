'use client';
import SyllabusCard from "../../../../../components/SyllabusCard";

export default function SyllabusHome() {
  return (
    <div className="space-y-6 p-4">
      <h1 className="text-3xl font-bold">📖Syllabus </h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SyllabusCard href="/student/syllabus/student/syllabus/grades" title="Quran" desc="View syllabus for all grades" />
        <SyllabusCard href="/student/syllabus/student/syllabus/islamic-studies" title="Islamic Education" desc="Imaan, Faith, Practices & A'maal" />
         <SyllabusCard href="/" title="Quran Translation & Tafseer" desc="View syllabus" />
         <SyllabusCard href="/" title="Urdu" desc="View syllabus" />
         <SyllabusCard href="/" title="English" desc="View syllabus" />


      </div>
    </div>
  );
}