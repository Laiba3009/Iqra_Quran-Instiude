"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import RoleBasedLayout from "@/components/RoleBasedLayout";

export default function ViewSyllabus() {
  const syllabusList = [
    { title: "Hadith Course", slug: "hadith" },
    { title: "Islamic Studies", slug: "islamic-studies" },
    { title: "Quran", slug: "quran" },
    { title: "English", slug: "english" },
    { title: "Urdu", slug: "urdu" },
  ];

  return (
    <RoleBasedLayout role="student">
      <div className="max-w-5xl mx-auto mt-20 p-6">
        <Card className="shadow-xl border border-gray-200 bg-white">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800">
              My Syllabus
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {syllabusList.map((s) => (
                  <Link key={s.slug} href={`/student/syllabus/student/syllabus/${s.slug}`}>

                  <div className="p-4 border rounded-lg bg-gray-50 hover:bg-gray-100 cursor-pointer transition">
                    <h3 className="font-semibold text-green-700 text-lg">
                      📘 {s.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Click to view {s.title} syllabus.
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </RoleBasedLayout>
  );
}
