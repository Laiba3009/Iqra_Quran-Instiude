"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function TeacherSchedule({
  students,
  teacher,
}: {
  students: any[];
  teacher: any;
}) {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
  });

  const todayClasses = students.flatMap((student) =>
    (student.class_days || [])
      .filter(
        (d: any) => d.day?.toLowerCase() === today.toLowerCase()
      )
      .map((d: any) => ({
        studentName: student.name,
        subject: d.subject,
        time: d.time,
      }))
  );

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

      {/* SCROLLABLE CONTENT */}
      <CardContent className="max-h-[420px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
        {/* GRID: 2 per row when classes are more */}
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
                <p className="text-sm text-gray-500">
                  ⏰ Time: {c.time}
                </p>
              </div>

              {/* Action Buttons (Always Visible) */}
              <div className="flex gap-2 flex-wrap">
                <Button
                  asChild={!!teacher.zoom_link}
                  disabled={!teacher.zoom_link}
                  className={`${
                    teacher.zoom_link
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "bg-gray-300 cursor-not-allowed"
                  } text-white`}
                >
                  {teacher.zoom_link ? (
                    <a
                      href={teacher.zoom_link}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      🎥 Join Zoom
                    </a>
                  ) : (
                    <span>🎥 Zoom Not Available</span>
                  )}
                </Button>

                <Button
                  asChild={!!teacher.google_meet_link}
                  disabled={!teacher.google_meet_link}
                  className={`${
                    teacher.google_meet_link
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-gray-300 cursor-not-allowed"
                  } text-white`}
                >
                  {teacher.google_meet_link ? (
                    <a
                      href={teacher.google_meet_link}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      📹 Join Google Meet
                    </a>
                  ) : (
                    <span>📹 Google Meet Not Available</span>
                  )}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
