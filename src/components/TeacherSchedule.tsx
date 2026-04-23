"use client";

import moment from "moment-timezone";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function TeacherSchedule({
  students,
  teacher,
}: {
  students: any[];
  teacher: any;
}) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
  });

  // ✅ Time format
  function formatPKTimeRoman(timePK: string) {
    if (!timePK) return "—";
    return moment.tz(timePK, "HH:mm", "Asia/Karachi").format("hh:mm A");
  }

  function formatStudentTimeRoman(timePK: string, timezone: string) {
    if (!timePK) return "—";
    const pkMoment = moment.tz(timePK, "HH:mm", "Asia/Karachi");
    return pkMoment.clone().tz(timezone).format("hh:mm A");
  }

  // ✅ Today classes with studentId FIX
  const todayClasses = students
    .flatMap((student) =>
      (student.class_days || [])
        .filter((d: any) => d.day?.toLowerCase() === today.toLowerCase())
        .map((d: any) => ({
          studentId: student.id, // ✅ IMPORTANT FIX
          studentName: student.name,
          subject: d.subject,
          time: d.time,
          timezone: student.timezone || "Asia/Karachi",
        }))
    )
    .sort((a, b) => {
      const timeA = moment.tz(a.time, "HH:mm", "Asia/Karachi");
      const timeB = moment.tz(b.time, "HH:mm", "Asia/Karachi");
      return timeA.diff(timeB);
    });

  // ✅ API CALL FUNCTION 🔥
  async function handleReminder(c: any) {
    try {
      setLoadingId(c.studentId);

      const res = await fetch("/api/send-reminder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          student_id: c.studentId,
          class_time: c.time,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Error sending reminder");
        return;
      }

      alert("✅ Reminder sent");
    } catch (err) {
      alert("❌ Server error");
    } finally {
      setLoadingId(null);
    }
  }

  if (todayClasses.length === 0) {
    return (
      <Card className="bg-gradient-to-r from-gray-50 to-gray-100 border shadow">
        <CardContent className="p-6 text-center text-gray-600 font-medium">
          No classes scheduled for today
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border shadow-lg bg-gradient-to-br from-green-50 to-blue-50">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-green-800">
          📅 Today&apos;s Classes ({today})
        </CardTitle>
      </CardHeader>

      <CardContent className="max-h-[420px] overflow-y-auto pr-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {todayClasses.map((c, i) => (
            <div
              key={i}
              className="bg-white rounded-xl border shadow-sm p-4 space-y-3 hover:shadow-md transition"
            >
              {/* Student Info */}
              <div>
                <p className="font-semibold text-gray-800 text-lg">
                  {c.studentName}
                </p>
                <p className="text-sm text-gray-600">
                  📘 Subject: {c.subject}
                </p>

                <div className="text-sm text-gray-500 space-y-1">
                  <p>🇵🇰 Pakistan Time: {formatPKTimeRoman(c.time)}</p>
                  <p>
                    🌍 Student Time:{" "}
                    {formatStudentTimeRoman(c.time, c.timezone)}
                  </p>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-2 flex-wrap">
                {/* Zoom */}
                <Button
                  asChild={!!teacher.zoom_link}
                  disabled={!teacher.zoom_link}
                  className={`${
                    teacher.zoom_link
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "bg-gray-300"
                  } text-white`}
                >
                  {teacher.zoom_link ? (
                    <a
                      href={teacher.zoom_link}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      🎥 Zoom
                    </a>
                  ) : (
                    <span>🎥 No Zoom</span>
                  )}
                </Button>

                {/* Meet */}
                <Button
                  asChild={!!teacher.google_meet_link}
                  disabled={!teacher.google_meet_link}
                  className={`${
                    teacher.google_meet_link
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-gray-300"
                  } text-white`}
                >
                  {teacher.google_meet_link ? (
                    <a
                      href={teacher.google_meet_link}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      📹 Meet
                    </a>
                  ) : (
                    <span>📹 No Meet</span>
                  )}
                </Button>

                {/* 🔔 Reminder */}
                <Button
                  onClick={() => handleReminder(c)}
                  disabled={loadingId === c.studentId}
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                >
                  {loadingId === c.studentId
                    ? "Sending..."
                    : "🔔 Reminder"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}