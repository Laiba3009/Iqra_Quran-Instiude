"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import moment from "moment-timezone";
import Link from "next/link";
interface ClassInfo {
  day: string;
  schedule: { time: string; subjects: string[] }[];
  teacher_name: string;
  zoom_link: string;
  google_meet_link: string;
}

export default function TodayClassesCard({ studentId, timezone }: { studentId: string; timezone: string }) {
  const [classes, setClasses] = useState<ClassInfo[]>([]);

  useEffect(() => {
    const fetchClasses = async () => {
      const { data: classDays } = await supabase
        .from("students")
        .select("class_days")
        .eq("id", studentId)
        .maybeSingle();
      if (!classDays) return;

      const today = moment().tz(timezone).format("dddd"); // local weekday

      // Filter today's classes
      const todayClasses = (classDays.class_days || []).filter((c: any) => c.day === today);

      // Group by day + teacher
      const grouped: Record<string, ClassInfo> = {};
      todayClasses.forEach((c: any) => {
        const key = c.day;
        if (!grouped[key]) grouped[key] = {
          day: c.day,
          teacher_name: c.teacher_name,
          zoom_link: c.zoom_link,
          google_meet_link: c.google_meet_link,
          schedule: [],
        };
        grouped[key].schedule.push({ time: c.time, subjects: [c.subject] });
      });

      setClasses(Object.values(grouped));
    };

    fetchClasses();
  }, [studentId, timezone]);

  if (!classes.length) return <p className="text-center text-gray-600">No classes today.</p>;

  return (
    <Card className="shadow-xl border border-green-200 w-[500px] text-center bg-white">
      <h1 className="text-3xl font-bold text-green-800 mb-6">📅 Today’s Classes</h1>
      <CardContent>
        {classes.map((cls, idx) => (
          <Card key={idx} className="shadow-md border-green-200 mb-4">
            <CardContent className="p-4 space-y-2">
              <h2 className="text-xl font-semibold text-green-700">{cls.day}</h2>
              <p><b>Teacher:</b> {cls.teacher_name}</p>
              {cls.schedule.map((s, i) => (
                <p key={i}>• {s.time} → {s.subjects.join(", ")}</p>
              ))}
              <div className="flex gap-2 pt-2">
                {cls.zoom_link && <Button className="bg-green-600 w-1/2" onClick={() => window.open(cls.zoom_link, "_blank")}>Zoom</Button>}
                {cls.google_meet_link && <Button className="bg-pink-500 w-1/2" onClick={() => window.open(cls.google_meet_link, "_blank")}>Google Meet</Button>}
              </div>
                   <Link href="/student/class-schedule"><Button className="bg-green-600 hover:bg-green-700">Class Schedule</Button></Link>

            </CardContent>            
          </Card>
        ))}
      </CardContent>
    </Card>
  );
}
