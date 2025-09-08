'use client';
// Update the import path below to the correct location of your data file
import { syllabusData } from "../app/student/data/syllabusData";
import { motion } from "framer-motion";

export default function HadithSection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white p-10 rounded-2xl shadow-lg border border-gray-200 max-w-4xl mx-auto overflow-x-auto"
    >
      {/* Main Title */}
      <h1 className="text-4xl font-extrabold text-green-800 mb-10 text-center tracking-wide">
        📖 60 Hadith for Children
      </h1>

      {/* Table */}
      <table className="w-full border border-gray-300 rounded-lg overflow-hidden">
        <thead className="bg-green-700 text-white text-lg">
          <tr>
            <th className="p-4 text-center">Group</th>
            <th className="p-4 text-center">Hadith Range</th>
          </tr>
        </thead>
        <tbody>
          {syllabusData.hadith.sections.map((sec, i) => (
            <tr
              key={i}
              className={`text-center text-lg ${
                i % 2 === 0 ? "bg-green-50" : "bg-green-100"
              }`}
            >
              <td className="p-4 font-bold text-brown-700">{sec.name}</td>
              <td className="p-4 text-green-900">{sec.range}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </motion.div>
  );
}
