"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
        (d: any) =>
          d.day?.toLowerCase() === today.toLowerCase()
      )
      .map((d: any) => ({
        studentName: student.name,
        subject: d.subject,
        time: d.time,
      }))
  );

  if (todayClasses.length === 0) {
    return (
      <Card className="bg-gray-50 border">
        <CardContent className="p-4 text-center text-gray-500">
          Aaj koi class nahi hai
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border bg-green-50 shadow">
      <CardHeader>
        <CardTitle className="text-green-800">
          📅 Today ({today}) Classes
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {todayClasses.map((c, i) => (
          <div
            key={i}
            className="bg-white p-4 rounded border space-y-2"
          >
            <div>
              <p className="font-semibold">{c.studentName}</p>
              <p className="text-sm text-gray-600">
                {c.subject} — {c.time}
              </p>
            </div>

            <div className="flex gap-2">
              {teacher.zoom_link && (
                <a
                  href={teacher.zoom_link}
                  target="_blank"
                  className="bg-blue-600 text-white px-4 py-1 rounded"
                >
                  Join Zoom
                </a>
              )}

              {teacher.google_meet_link && (
                <a
                  href={teacher.google_meet_link}
                  target="_blank"
                  className="bg-green-600 text-white px-4 py-1 rounded"
                >
                  Join Google Meet
                </a>
              )}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
