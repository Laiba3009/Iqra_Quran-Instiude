'use client';
import { syllabusData } from "../app/student/data/syllabusData";
import { motion } from "framer-motion";

export default function HadithSection() {
  const sections = syllabusData.hadith.sections;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white p-6 md:p-10 rounded-2xl shadow-lg border border-gray-200 max-w-4xl mx-auto"
    >
      {/* Main Title */}
      <h1 className="text-3xl md:text-4xl font-extrabold text-green-800 mb-8 md:mb-10 text-center tracking-wide">
        📖 60 Hadith for Children
      </h1>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full border border-gray-300 rounded-lg overflow-hidden">
          <thead className="bg-green-700 text-white text-lg">
            <tr>
              <th className="p-4 text-center w-1/2">Group</th>
              <th className="p-4 text-center w-1/2">Hadith Range</th>
            </tr>
          </thead>
          <tbody>
            {sections.map((sec, i) => (
              <tr
                key={i}
                className={`text-center text-lg ${
                  i % 2 === 0 ? "bg-green-50" : "bg-green-100"
                }`}
              >
                <td className="p-4 font-bold text-green-800">{sec.name}</td>
                <td className="p-4 text-green-900">{sec.range}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden flex flex-col gap-4">
        {sections.map((sec, i) => (
          <div
            key={i}
            className="bg-green-50 border border-green-200 rounded-lg p-4 shadow-sm"
          >
            <h2 className="font-bold text-green-800 mb-2">{sec.name}</h2>
            <p className="text-green-900">{sec.range}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
