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
      className="bg-white p-6 md:p-10 rounded-2xl shadow-lg border border-gray-200 max-w-6xl mx-auto"
    >
      {/* Main Title */}
      <h1 className="text-3xl md:text-4xl font-extrabold text-green-800 mb-8 md:mb-10 text-center tracking-wide">
        🕌 Islamic Studies
      </h1>

      {/* Table for large screens */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full border border-gray-300 rounded-lg overflow-hidden">
          <thead className="bg-green-700 text-white text-lg">
            <tr>
              <th className="p-4 text-center w-1/4">Part</th>
              <th className="p-4 text-center w-3/4">Topics</th>
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
                <td className="p-4 font-bold text-green-900">{part.title}</td>
                <td className="p-4 text-green-900 text-left">
                  <ul className="list-disc list-inside space-y-1">
                    {part.topics.map((topic: string, j: number) => (
                      <li key={j}>{topic}</li>
                    ))}
                  </ul>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile view: cards */}
      <div className="md:hidden flex flex-col gap-4">
        {parts.map((part: any, i: number) => (
          <div
            key={i}
            className="bg-green-50 border border-green-200 rounded-lg p-4 shadow-sm"
          >
            <h2 className="font-bold text-green-800 mb-2">{part.title}</h2>
            <ul className="list-disc list-inside text-green-900 space-y-1">
              {part.topics.map((topic: string, j: number) => (
                <li key={j}>{topic}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
