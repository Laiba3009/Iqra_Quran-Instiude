"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, Users } from "lucide-react";
import BannerSlider from "@/components/BannerSlider";
import Header from "@/components/Header";
import { motion } from "framer-motion";

export default function HomePage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <div className="w-full overflow-x-hidden bg-gray-50">
      {/* Header */}
      <Header toggleSidebar={toggleSidebar} role="guest" />

      {/* Full Width Banner */}
      <div className="mt-16">
        <BannerSlider />

        {/* Cards Section */}
        <section className="w-full py-16 bg-gray-50">
          <div className="max-w-6xl mx-auto px-6">
            <motion.h2
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-800"
            >
              Welcome to IQRA Online Quran Portal
            </motion.h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Student Card */}
              <Link href="/login?role=student">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                >
                  <Card className="cursor-pointer transition-shadow shadow-md hover:shadow-xl border-t-4 border-green-500">
                    <CardHeader className="flex items-center gap-4">
                      <GraduationCap className="w-12 h-12 text-green-600" />
                      <CardTitle className="text-xl font-semibold text-gray-800">
                        Student Portal
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600">
                        Access your Quran classes, syllabus, track your progress online.
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              </Link>

              {/* Teacher Card */}
              <Link href="/login?role=teacher">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: 0.2 }}
                >
                  <Card className="cursor-pointer transition-shadow shadow-md hover:shadow-xl border-t-4 border-blue-500">
                    <CardHeader className="flex items-center gap-4">
                      <Users className="w-12 h-12 text-blue-600" />
                      <CardTitle className="text-xl font-semibold text-gray-800">
                        Teacher Portal
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600">
                        Manage your Quran classes, students, reports efficiently online.
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
