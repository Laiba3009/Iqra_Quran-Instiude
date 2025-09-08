'use client';
import { syllabusData } from "../app/student/data/syllabusData";
import { motion } from "framer-motion";

export default function TopicList() {
  const parts = Object.values(syllabusData.islamicStudies.parts);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white p-10 rounded-2xl shadow-lg border border-gray-200 max-w-6xl mx-auto overflow-x-auto"
    >
      {/* Main Title */}
      <h1 className="text-4xl font-extrabold text-green-800 mb-10 text-center tracking-wide">
        🕌 Islamic Studies
      </h1>

      {/* Table */}
      <table className="w-full border border-gray-300 rounded-lg overflow-hidden">
        <thead className="bg-green-700 text-white text-lg">
          <tr>
            <th className="p-4 text-center">Part</th>
            <th className="p-4 text-center">Topics</th>
          </tr>
        </thead>
        <tbody>
          {parts.map((part: any, i: number) => (
            <tr
              key={i}
              className={`text-center text-lg ${
                i % 2 === 0 ? "bg-green-50" : "bg-green-100"
              }`}
            >
              {/* Part Title */}
              <td className="p-4 font-bold text-brown-700 w-1/4">
                {part.title}
              </td>

              {/* Topics List */}
              <td className="p-4 text-green-900 w-3/4">
                <ul className="list-disc list-inside space-y-1 text-left">
                  {part.topics.map((topic: string, j: number) => (
                    <li key={j}>{topic}</li>
                  ))}
                </ul>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </motion.div>
  );
}
