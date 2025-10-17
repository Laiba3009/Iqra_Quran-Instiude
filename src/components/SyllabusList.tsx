'use client';

import { syllabusData } from "../app/student/data/syllabusData";
import { motion } from "framer-motion";

export default function SyllabusList() {
  const grades = Object.entries(syllabusData).filter(([key]) =>
    key.toLowerCase().startsWith("grade")
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white p-6 md:p-10 rounded-2xl shadow-lg border border-gray-200 max-w-6xl mx-auto"
    >
      {/* Main Title */}
      <h1 className="text-3xl md:text-4xl font-extrabold text-green-800 mb-8 md:mb-10 text-center tracking-wide">
        Namaz, Dua & Kalimas
      </h1>

      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full border border-gray-300 rounded-lg overflow-hidden">
          <thead className="bg-green-700 text-white text-lg">
            <tr>
              <th className="p-4 text-center w-1/4">Grade</th>
              <th className="p-4 text-center w-3/4">Contents</th>
            </tr>
          </thead>
          <tbody>
            {grades.map(([key, value], index) => (
              <tr
                key={key}
                className={`text-center text-lg ${
                  index % 2 === 0 ? "bg-green-50" : "bg-green-100"
                }`}
              >
                <td className="p-4 font-bold text-green-800">{value.title}</td>
                <td className="p-4 text-green-900">
                  {"items" in value && Array.isArray(value.items)
                    ? value.items.join(", ")
                    : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden flex flex-col gap-4">
        {grades.map(([key, value], index) => (
          <div
            key={key}
            className="bg-green-50 border border-green-200 rounded-lg p-4 shadow-sm"
          >
            <h2 className="font-bold text-green-800 mb-2">{value.title}</h2>
            <p className="text-green-900">
              {"items" in value && Array.isArray(value.items)
                ? value.items.join(", ")
                : "-"}
            </p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
