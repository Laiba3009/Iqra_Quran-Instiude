'use client';

export default function TeacherRulesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-900 to-blue-950 text-white px-8 py-12">
      {/* 🔹 Header */}
      <header className="flex items-center gap-4 mb-10">
        <img
          src="/images/logo1.jpg"
          alt="Institute Logo"
          className="w-14 h-14 rounded-full border-2 border-blue-300"
        />
        <h1 className="text-4xl font-bold text-blue-200">
          Iqra Online Quran Institute
        </h1>
      </header>

      {/* 🔹 Page Title */}
      <h2 className="text-3xl font-bold text-blue-100 mb-6 border-b border-blue-700 pb-2">
         Teacher Rules & Regulations
      </h2>

      {/* 🔹 Intro */}
      <p className="text-lg text-blue-100 leading-relaxed mb-8">
        Welcome respected teachers! Please go through the following guidelines carefully. 
        These rules are designed to maintain professionalism and ensure a disciplined 
        and effective teaching environment at our institute.
      </p>

      {/* 🔹 Rules List */}
      <ul className="space-y-4 text-blue-100 text-lg leading-relaxed list-disc list-inside">
        <li>Be punctual and attend all scheduled classes on time.</li>
        <li>Maintain accurate attendance records for every student.</li>
        <li>Submit lesson plans and student progress reports weekly.</li>
        <li>Ensure discipline and respect during every class session.</li>
        <li>Communicate politely and professionally with students and parents.</li>
        <li>Keep all student data and discussions confidential.</li>
        <li>Report any issues or misconduct immediately to the administration.</li>
      </ul>

      {/* 🔹 Footer Note */}
      <p className="mt-10 text-blue-300 text-base border-t border-blue-700 pt-4">
        ⚠️ All teachers must comply with these regulations. Violations may result 
        in disciplinary action by the administration of Iqra Online Quran Institute.
      </p>
    </div>
  );
}
