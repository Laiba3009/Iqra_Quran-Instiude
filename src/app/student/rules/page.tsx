'use client';

export default function StudentRulesPage() {
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
        🎓 Student Rules & Guidelines
      </h2>

      {/* 🔹 Intro */}
      <p className="text-lg text-blue-100 leading-relaxed mb-8">
        Dear students, welcome to Iqra Online Quran Institute. To ensure 
        a peaceful and productive learning environment, please follow the 
        rules below carefully.
      </p>

      {/* 🔹 Rules List */}
      <ul className="space-y-4 text-blue-100 text-lg leading-relaxed list-disc list-inside">
        <li>Join your class on time and with full concentration.</li>
        <li>Respect your teachers and fellow students at all times.</li>
        <li>Keep your mic and camera ready when required by the teacher.</li>
        <li>Never use rude or inappropriate language during class.</li>
        <li>Complete your homework and revision regularly.</li>
        <li>Inform your teacher in advance if you are unable to attend class.</li>
        <li>Maintain a positive attitude toward Quran learning and Islamic values.</li>
      </ul>

      {/* 🔹 Footer Note */}
      <p className="mt-10 text-blue-300 text-base border-t border-blue-700 pt-4">
        ⚠️ Following these rules ensures a respectful environment for all. 
        Repeated violations may lead to administrative action by 
        Iqra Online Quran Institute.
      </p>
    </div>
  );
}
