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
      className="bg-white p-10 rounded-2xl shadow-lg border border-gray-200 max-w-6xl mx-auto overflow-x-auto"
    >
      {/* Main Title */}
      <h1 className="text-4xl font-extrabold text-green-800 mb-10 text-center tracking-wide">
       Syllabus 📚 
      </h1>

      {/* Table */}
      <table className="w-full border border-gray-300 rounded-lg overflow-hidden">
        <thead className="bg-green-700 text-white text-lg">
          <tr>
            <th className="p-4 text-center">Grade</th>
            <th className="p-4 text-center">Contents</th>
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
              {/* Grade Title */}
              <td className="p-4 font-bold text-brown-700">{value.title}</td>

              {/* Subjects List */}
              <td className="p-4 text-green-900">
                {"items" in value &&
                  Array.isArray(value.items) &&
                  value.items.join(", ")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </motion.div>
  );
}
