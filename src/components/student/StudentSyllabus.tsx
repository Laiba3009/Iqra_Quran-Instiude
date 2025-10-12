"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function StudentSyllabus({ email }: { email: string }) {
  const [courses, setCourses] = useState<string[]>([]);
  const [syllabus, setSyllabus] = useState<any[]>([]);

  useEffect(()=>{
    async function load() {
      const { data: student, error } = await supabase.from("students").select("courses").eq("email", email).single();
      if (error || !student) { console.error(error); setCourses([]); return; }
      const studentCourses = student.courses || [];
      setCourses(studentCourses);

      if (studentCourses.length === 0) { setSyllabus([]); return; }

      // fetch syllabus entries for those courses (we call server API)
      const q = new URL("/api/syllabus", location.origin);
      // server route accepts ?course=... for single; but for many, fetch all and filter client-side
      const res = await fetch("/api/syllabus");
      const data = await res.json();
      const filtered = (data || []).filter((s:any) => studentCourses.includes(s.course_name));
      setSyllabus(filtered);
    }
    load();
  }, [email]);

  return (
    <div className="bg-white p-6 rounded-xl shadow">
      <h2 className="text-2xl font-bold mb-3">My Syllabus</h2>
      {courses.length > 0 && <p className="text-sm text-gray-600 mb-4">Courses: <b>{courses.join(", ")}</b></p>}
      {syllabus.length === 0 ? <p>No syllabus available.</p> : (
        <div className="space-y-4">
          {syllabus.map(s => (
            <div key={s.id} className="p-3 border rounded">
              <div className="font-semibold">{s.course_name} — {s.grade} — {s.title}</div>
              <div className="text-sm text-gray-700">{(s.topics||[]).join(", ")}</div>
              {s.description && <div className="text-sm mt-2 text-gray-600">{s.description}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
