"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface ClassInfo {
  id: string;
  day: string;
  time: string;
  teacher_name: string;
  subject: string; // ✅ Subject added
  zoom_link: string;
}

export default function ClassSchedulePage() {
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [studentName, setStudentName] = useState("");

  const getCookie = (name: string) => {
    const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
    return match ? match[2] : null;
  };

  useEffect(() => {
    loadSchedule();
  }, []);

  const loadSchedule = async () => {
    try {
      const rollNo = getCookie("student_roll");
      if (!rollNo) return;

      const { data: student } = await supabase
        .from("students")
        .select("id, name, roll_no, class_days")
        .eq("roll_no", rollNo)
        .maybeSingle();

      if (!student) return;
      setStudentName(student.name);

      const { data: teacherMap } = await supabase
        .from("student_teachers")
        .select("teacher_id, teachers(name, zoom_link)")
        .eq("student_id", student.id);

      const teacherInfoMap: Record<string, { name: string; zoom_link: string }> = {};
      teacherMap?.forEach((t) => {
        if (t.teachers) {
          teacherInfoMap[t.teacher_id] = {
            name: t.teachers.name,
            zoom_link: t.teachers.zoom_link || "",
          };
        }
      });

      const weeklyClasses: ClassInfo[] = [];
      (student.class_days || []).forEach((cd, idx) => {
        const teacherIds = Object.keys(teacherInfoMap);
        const teacher = teacherIds.length > 0 ? teacherInfoMap[teacherIds[0]] : { name: "TBD", zoom_link: "" };
        weeklyClasses.push({
          id: `${cd.day}-${idx}`,
          day: cd.day,
          time: cd.time || "TBD",
          subject: cd.subject || "TBD", // ✅ Subject included
          teacher_name: teacher.name,
          zoom_link: teacher.zoom_link,
        });
      });

      setClasses(weeklyClasses);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinClass = async (cls: ClassInfo) => {
    try {
      const rollNo = getCookie("student_roll");
      if (!rollNo) return;

      const { data: student } = await supabase
        .from("students")
        .select("id, name, roll_no")
        .eq("roll_no", rollNo)
        .maybeSingle();

      if (!student) return;

      // ✅ Attendance insert with subject
      await supabase.from("attendance").insert([
        {
          student_name: student.name,
          student_roll: student.roll_no,
          teacher_name: cls.teacher_name,
          subject: cls.subject, // ✅ Subject included
          joined_at: new Date().toISOString(),
        },
      ]);

      // Open Zoom
      if (cls.zoom_link) window.open(cls.zoom_link, "_blank");
    } catch (err) {
      console.error("Attendance error:", err);
    }
  };

  if (loading) return <p className="text-center mt-10">Loading schedule...</p>;

  return (
    <div className="max-w-5xl mx-auto mt-20 p-6">
      <h1 className="text-3xl font-bold text-green-800 mb-6 text-center">
        📅 {studentName ? `${studentName}'s Class Schedule` : "Class Schedule"}
      </h1>

      {classes.length === 0 ? (
        <p className="text-center text-gray-600">No classes found for this week.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((cls) => (
            <Card key={cls.id} className="shadow-md border-green-200">
              <CardContent className="p-4 space-y-3">
                <h2 className="text-xl font-semibold text-green-700">{cls.day}</h2>
                <p className="text-gray-700"><b>Time:</b> {cls.time}</p>
                <p className="text-gray-700"><b>Teacher:</b> {cls.teacher_name}</p>
                <p className="text-gray-700"><b>Subject:</b> {cls.subject}</p>
                <Button
                  className="bg-green-600 hover:bg-green-700 text-white w-full"
                  disabled={!cls.zoom_link}
                  onClick={() => handleJoinClass(cls)}
                >
                  Join Zoom Class
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
