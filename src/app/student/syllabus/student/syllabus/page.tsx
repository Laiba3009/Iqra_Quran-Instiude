'use client';
import SyllabusCard from "../../../../../components/SyllabusCard";

export default function SyllabusHome() {
  // 👇 Ye mapping yahan likhni hai
  const syllabusRoutes: Record<string, string> = {
    "Hadith Course": "hadith",
    "Islamic Studies": "islamic-studies",
    "Quran": "grades",
    "English": "english",
    "Urdu": "urdu",
  };

  return (
    <div className="space-y-6 p-4">
<h1 className="text-4xl font-bold text-center text-gray-800 mb-6">
        Syllabus
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 👇 yahan href mapping ke zariye generate ho raha hai */}
        <SyllabusCard
          href={`/student/syllabus/student/syllabus/${syllabusRoutes["Quran"]}`}
          title="Quran"
          desc="View syllabus for all grades"
        />

        <SyllabusCard
          href={`/student/syllabus/student/syllabus/${syllabusRoutes["Islamic Studies"]}`}
          title="Islamic Education"
          desc="Imaan, Faith, Practices & A'maal"
        />

        <SyllabusCard
          href={`/student/syllabus/student/syllabus/${syllabusRoutes["Hadith Course"]}`}
          title="Hadith Course"
          desc="View syllabus"
        />

        <SyllabusCard
          href={`/student/syllabus/student/syllabus/${syllabusRoutes["Urdu"]}`}
          title="Urdu"
          desc="View syllabus"
        />

        <SyllabusCard
          href={`/student/syllabus/student/syllabus/${syllabusRoutes["English"]}`}
          title="English"
          desc="View syllabus"
        />
      </div>
    </div>
  );
}
