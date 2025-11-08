'use client';

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

function getCookie(name: string) {
  return document.cookie.split("; ").reduce((r, v) => {
    const parts = v.split("=");
    return parts[0].trim() === name ? decodeURIComponent(parts[1]) : r;
  }, "");
}

export default function TeacherSyllabusPage() {
  const [teacher, setTeacher] = useState<any>(null);

  useEffect(() => {
    const roll = getCookie("teacher_roll");
    if (roll) loadTeacher(roll);
  }, []);

  const loadTeacher = async (rollNo: string) => {
    const { data } = await supabase
      .from("teachers")
      .select("name, syllabus")
      .eq("roll_no", rollNo)
      .maybeSingle();

    setTeacher(data);
  };

  if (!teacher)
    return (
      <div className="p-8 text-center text-gray-100 font-medium bg-blue-950 min-h-screen flex items-center justify-center">
        Loading syllabus...
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-950 to-blue-900 text-white px-6 md:px-20 py-10">
      <div className="max-w-5xl mx-auto">
        {/* 🔙 Back Button */}
        <div className="mb-6">
          <Link href="/teacher/dashboard">
            <Button
              className="bg-blue-800 hover:bg-blue-700 text-white flex items-center gap-2"
            >
              <ArrowLeft size={18} />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        {/* 📘 Syllabus Card */}
        <Card className="shadow-2xl border-none bg-blue-800/40 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-3xl text-center text-blue-100 font-bold">
              {teacher.name} ka Assigned Syllabus
            </CardTitle>
          </CardHeader>

          <CardContent>
            {teacher.syllabus?.length ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {teacher.syllabus.map((subject: string, i: number) => (
                  <Link
                    key={i}
                    href={`/teacher/syllabus/${subject
                      .toLowerCase()
                      .replace(/\s+/g, "-")}`}
                  >
                    <div className="p-5 border border-blue-400 rounded-2xl bg-blue-200 text-blue-900 hover:bg-blue-300 cursor-pointer transition shadow-lg hover:shadow-xl">
                      <h3 className="font-semibold text-xl">
                        📘 {subject}
                      </h3>
                      <p className="text-sm mt-1 opacity-80">
                        Click karo taake {subject} ka syllabus dekho.
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-blue-200 text-center py-10 text-lg">
                Abhi tak koi syllabus assign nahi hua.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
