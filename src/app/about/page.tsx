'use client';

import * as React from "react";
// ✅ Import this way for full Next.js support
import { motion } from "framer-motion";

export default function AboutPage() {
  return (
    <section className="w-full min-h-screen bg-[#0f1724] text-white py-16 flex items-center justify-center">
      <div className="max-w-5xl px-6 text-center">
        {/* Heading */}
        <motion.h1
          className="text-4xl md:text-5xl font-bold mb-6 text-cyan-400"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          IQRA Online Quran Institute
        </motion.h1>

        {/* Paragraph 1 */}
        <motion.p
          className="text-lg text-gray-300 leading-relaxed mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.8 }}
        >
          IQRA Online Quran Institute is a trusted global platform dedicated to
          teaching the Holy Quran and Islamic knowledge to students of all ages —
          children, youth, and adults. Our mission is to make Quranic education
          accessible, engaging, and spiritually enriching for everyone, right
          from the comfort of their homes.
        </motion.p>

        {/* Paragraph 2 */}
        <motion.p
          className="text-lg text-gray-300 leading-relaxed mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.8 }}
        >
          We offer a variety of online courses, including{" "}
          <span className="text-cyan-400 font-semibold">
            Quran Reading, Tajweed, and Tafseer
          </span>
          , taught by experienced and qualified male and female tutors. In
          addition, we provide{" "}
          <span className="text-cyan-400 font-semibold">
            English and Urdu language courses
          </span>
          , helping students improve their communication skills while deepening
          their understanding of Islamic teachings.
        </motion.p>

        {/* Paragraph 3 */}
        <motion.p
          className="text-lg text-gray-300 leading-relaxed mb-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.8 }}
        >
          Our curriculum also includes{" "}
          <span className="text-cyan-400 font-semibold">Islamic Studies</span>,
          covering essential topics like basic Fiqh, daily duas, and moral
          education. Whether you are a beginner or an advanced learner, our
          instructors offer personalized one-on-one attention to help you
          progress at your own pace with confidence and clarity.
        </motion.p>

        {/* Paragraph 4 */}
        <motion.p
          className="text-lg text-gray-300 leading-relaxed"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.8 }}
        >
          At IQRA, we believe that learning the Quran is not just about
          recitation — it’s about reflection, understanding, and living its
          message.
        </motion.p>

        {/* Final line */}
        <motion.div
          className="mt-10 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2, duration: 0.8 }}
        >
          <p className="text-xl text-cyan-300 font-semibold">
            “Learn the Quran, Understand Islam, and Illuminate Your Life.”
          </p>
        </motion.div>
      </div>
    </section>
  );
}
