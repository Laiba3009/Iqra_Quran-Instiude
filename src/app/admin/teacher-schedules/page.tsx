"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import TeacherSchedule from "@/components/TeacherSchedule";

export default function AdminTeacherSchedules() {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [selectedTeacher, setSelectedTeacher] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // 🔹 Load all teachers
  useEffect(() => {
    loadTeachers();
  }, []);

  const loadTeachers = async () => {
    const { data } = await supabase
      .from("teachers")
      .select("id, name, zoom_link, google_meet_link")
      .order("name");

    setTeachers(data || []);
  };

  // 🔹 When admin clicks a teacher
  const loadTeacherSchedule = async (teacher: any) => {
    setSelectedTeacher(teacher);
    setLoading(true);

    const { data } = await supabase
      .from("student_teachers")
      .select(
        `
        students (
          id,
          name,
          class_days,
          status
        )
      `
      )
      .eq("teacher_id", teacher.id);

    // ❌ disabled students remove
    const activeStudents =
      data
        ?.map((d: any) => d.students)
        .filter((s: any) => s && s.status === "active") || [];

    setStudents(activeStudents);
    setLoading(false);
  };

  return (
    <div className="p-6 max-w-7xl mt-16 mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
      {/* LEFT: Teacher List */}
      <div className="bg-white rounded-xl shadow p-4">
        <h2 className="font-bold text-lg mb-3 text-green-700">
          👩‍🏫 Teachers
        </h2>

        <ul className="space-y-2 max-h-[500px] overflow-y-auto">
          {teachers.map((t) => (
            <li
              key={t.id}
              onClick={() => loadTeacherSchedule(t)}
              className={`cursor-pointer p-2 rounded border
                ${
                  selectedTeacher?.id === t.id
                    ? "bg-green-100 border-green-500"
                    : "hover:bg-gray-50"
                }`}
            >
              {t.name}
            </li>
          ))}
        </ul>
      </div>

      {/* RIGHT: Today Schedule */}
      <div className="md:col-span-2 mt-16">
        {!selectedTeacher && (
          <div className="bg-gray-50 p-6 rounded-xl text-center text-gray-500">
            Select a teacher to view today&apos;s schedule
          </div>
        )}

        {selectedTeacher && loading && (
          <div className="p-6 text-center">Loading schedule...</div>
        )}

        {selectedTeacher && !loading && (
          <TeacherSchedule
            teacher={selectedTeacher}
            students={students}
          />
        )}
      </div>
    </div>
  );
}
