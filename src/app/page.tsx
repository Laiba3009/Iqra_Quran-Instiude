"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { GraduationCap, Users } from "lucide-react";
import BannerSlider from "@/components/BannerSlider";

export default function HomePage() {
  return (
    <div className="w-full overflow-x-hidden">
      {/* 👇 Full Width Banner */}
      <BannerSlider />

      {/* 👇 Cards Section */}
      <section className="w-full bg-gray-50 py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-800">
            Welcome to the Portal
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Student Card */}
            <Link href="/login?role=student">
              <Card className="cursor-pointer hover:shadow-xl transition border-t-4 border-green-500">
                <CardHeader>
                  <GraduationCap className="w-12 h-12 text-green-600" />
                  <CardTitle>
                    <span className="text-xl">Student Portal</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Access your classes, syllabus, assignments, and progress.
                  </p>
                </CardContent>
              </Card>
            </Link>

            {/* Teacher Card */}
            <Link href="/login?role=teacher">
              <Card className="cursor-pointer hover:shadow-xl transition border-t-4 border-blue-500">
                <CardHeader>
                  <Users className="w-12 h-12 text-blue-600" />
                  <CardTitle>
                    <span className="text-xl">Teacher Portal</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Manage your classes, students, and reports.
                  </p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
