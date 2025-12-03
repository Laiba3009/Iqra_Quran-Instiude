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
  subject: string;
  zoom_link: string;
  google_meet_link: string;
}

// ----------------------
// TIMEZONE OFFSETS
// ----------------------
const tzOffsets: Record<string, number> = {
  "Pakistan (PKT)": 5,
  "Turkey (TRT)": 3,
  "United Kingdom (GMT)": 0,
  "USA - New York (EST)": -5,
  "China (CST)": 8,
  "Japan (JST)": 9,
  "Australia (AEST)": 10,
  "India (IST)": 5.5,
  "Singapore (SGT)": 8,
  "New Zealand (NZST)": 12,
  "Germany (CET)": 1,
  "Belgium (CET)": 1,
  "Gulf (UAE/Oman)": 4,
};

// ----------------------
// UTC → LOCAL (12-HR)
// ----------------------
function utcToLocal(utcTime: string, timezone: string) {
  if (!utcTime || !timezone) return "";

  const [h, m] = utcTime.split(":").map(Number);
  const offset = tzOffsets[timezone] ?? 0;

  let local = h + offset;
  if (local >= 24) local -= 24;
  if (local < 0) local += 24;

  const period = local >= 12 ? "PM" : "AM";
  const hour12 = (local % 12) || 12;

  return `${hour12.toString().padStart(2, "0")}:${m
    .toString()
    .padStart(2, "0")} ${period}`;
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
    setLoading(true);
    try {
      const rollNo = getCookie("student_roll");
      if (!rollNo) return;

      const { data: student } = await supabase
        .from("students")
        .select("id, name, roll_no, timezone, class_days")
        .eq("roll_no", rollNo)
        .maybeSingle();

      if (!student) return;

      setStudentName(student.name);

      // Fetch teacher + links
      const { data: teacherMap } = await supabase
        .from("student_teachers")
        .select("teacher_id, teachers(name, zoom_link, google_meet_link)")
        .eq("student_id", student.id);

      const teacherInfoMap: Record<
        string,
        { name: string; zoom_link: string; google_meet_link: string }
      > = {};

      // 🟢 FIXED — no more TS errors
      teacherMap?.forEach((t: any) => {
        const teacher = t.teachers || {};
        teacherInfoMap[t.teacher_id] = {
          name: teacher.name || "",
          zoom_link: teacher.zoom_link || "",
          google_meet_link: teacher.google_meet_link || "",
        };
      });

      // BUILD WEEKLY CLASSES
      const weeklyClasses: ClassInfo[] = (student.class_days || []).map(
        (cd: any, idx: number) => {
          const teacherIds = Object.keys(teacherInfoMap);
          const teacher =
            teacherIds.length > 0
              ? teacherInfoMap[teacherIds[0]]
              : { name: "TBD", zoom_link: "", google_meet_link: "" };

          return {
            id: `${cd.day}-${idx}`,
            day: cd.day,
            time: utcToLocal(cd.time, student.timezone),
            subject: cd.subject || "TBD",
            teacher_name: teacher.name,
            zoom_link: teacher.zoom_link,
            google_meet_link: teacher.google_meet_link,
          };
        }
      );

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

      await supabase.from("attendance").insert([
        {
          student_name: student.name,
          student_roll: student.roll_no,
          teacher_name: cls.teacher_name,
          subject: cls.subject,
          joined_at: new Date().toISOString(),
        },
      ]);

      if (cls.zoom_link) window.open(cls.zoom_link, "_blank");
    } catch (err) {
      console.error("Error joining class:", err);
    }
  };

  if (loading)
    return <p className="text-center mt-10">Loading schedule...</p>;

  return (
    <div className="max-w-5xl mx-auto mt-20 p-6 space-y-6">
      <h1 className="text-3xl font-bold text-green-800 text-center">
        📅 {studentName ? `${studentName}'s Class Schedule` : "Class Schedule"}
      </h1>

      {classes.length === 0 ? (
        <p className="text-center text-gray-600">No classes found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((cls) => (
            <Card key={cls.id} className="shadow-md border-green-200">
              <CardContent className="p-4 space-y-3">
                <h2 className="text-xl font-semibold text-green-700">
                  {cls.day}
                </h2>
                <p className="text-gray-700">
                  <b>Time:</b> {cls.time}
                </p>
                <p className="text-gray-700">
                  <b>Teacher:</b> {cls.teacher_name}
                </p>
                <p className="text-gray-700">
                  <b>Subject:</b> {cls.subject}
                </p>

                {/* BUTTONS SIDE BY SIDE */}
                <div className="flex gap-2">
                  {/* Zoom Button */}
                  <Button
                    className="bg-green-600 hover:bg-green-700 text-white w-1/2 py-2"
                    disabled={!cls.zoom_link}
                    onClick={() => handleJoinClass(cls)}
                  >
                    Zoom
                  </Button>

                  {/* Google Meet Button */}
                  <a
                    href={cls.google_meet_link || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-1/2 py-2 text-center rounded-md text-white font-medium
                      ${
                        cls.google_meet_link
                          ? "bg-pink-500 hover:bg-pink-600"
                          : "bg-gray-400 cursor-not-allowed"
                      }
                    `}
                  >
                    Google Meet
                  </a>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
