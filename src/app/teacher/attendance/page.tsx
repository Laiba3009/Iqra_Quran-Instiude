"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";

/* 🔹 helper: cookie se teacher roll no */
const getTeacherRoll = () => {
  if (typeof document === "undefined") return null;
  return document.cookie
    .split("; ")
    .find(row => row.startsWith("teacher_roll="))
    ?.split("=")[1];
};

export default function TeacherAttendance() {
  const [teacher, setTeacher] = useState<any>(null);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [students, setStudents] = useState<any[]>([]);
  const [attendance, setAttendance] = useState<Record<string, string>>({});
  const today = new Date().toISOString().split("T")[0];

  /* 🔹 Load logged-in teacher */
  useEffect(() => {
    const loadTeacher = async () => {
      const roll = getTeacherRoll();
      if (!roll) return;

      const { data, error } = await supabase
        .from("teachers")
        .select("id, name, syllabus")
        .eq("roll_no", roll)
        .single();

      if (error) {
        console.error("Teacher load error:", error);
        return;
      }

      setTeacher(data);
      setSubjects(data.syllabus || []);
    };

    loadTeacher();
  }, []);

  /* 🔹 Load students linked to teacher after subject select */
  useEffect(() => {
    if (!selectedSubject || !teacher) return;

    const loadStudents = async () => {
      // ✅ teacher_id ke basis pe students fetch karo
      const { data, error } = await supabase
        .from("student_teachers")
        .select(
          `students (
            id,
            name,
            roll_no,
            syllabus
          )`
        )
        .eq("teacher_id", teacher.id); // <- yaha fix kiya

      if (error) {
        console.error("Students load error:", error);
        return;
      }

      if (!data) return;

      // ✅ filter only selected subject students
      const filtered = data
        .map((d: any) => d.students)
        .filter(
          (s: any) =>
            Array.isArray(s.syllabus) &&
            s.syllabus.includes(selectedSubject)
        );

      setStudents(filtered);
    };

    loadStudents();
  }, [selectedSubject, teacher]);

  /* 🔹 Mark attendance */
  const markAttendance = (studentId: string, status: "present" | "absent") => {
    setAttendance(prev => ({
      ...prev,
      [studentId]: status,
    }));
  };

  /* 🔹 Save attendance */
  const saveAttendance = async () => {
    if (!selectedSubject) {
      alert("Select subject first");
      return;
    }

    const rows = Object.entries(attendance).map(
      ([student_id, status]) => ({
        student_id,
        teacher_id: teacher.id,
        subject: selectedSubject,
        status,
        date: today,
      })
    );

    if (rows.length === 0) {
      alert("No attendance marked");
      return;
    }

    const { error } = await supabase.from("attendance").insert(rows);

    if (error) {
      console.error(error);
      alert("Error saving attendance");
      return;
    }

    alert("Attendance saved ✅");
    setAttendance({});
  };

  if (!teacher) {
    return <div className="p-6 text-center">Loading teacher...</div>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-center">
        Attendance – {teacher.name}
      </h1>

      {/* 🔹 Subject Select */}
      <select
        className="border p-2 rounded w-full"
        value={selectedSubject}
        onChange={(e) => setSelectedSubject(e.target.value)}
      >
        <option value="">Select Subject</option>
        {subjects.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>

      {/* 🔹 Students List */}
      {students.length > 0 && (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <table className="w-full border-collapse">
            <thead className="bg-green-100">
              <tr>
                <th className="p-3 text-left">Roll No</th>
                <th className="p-3 text-left">Student</th>
                <th className="p-3 text-center">Attendance</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.id} className="border-t">
                  <td className="p-3">{s.roll_no}</td>
                  <td className="p-3">{s.name}</td>
                  <td className="p-3 flex justify-center gap-2">
                    <Button
                      size="sm"
                      className={
                        attendance[s.id] === "present"
                          ? "bg-green-600 text-white"
                          : "bg-gray-200"
                      }
                      onClick={() => markAttendance(s.id, "present")}
                    >
                      Present
                    </Button>

                    <Button
                      size="sm"
                      className={
                        attendance[s.id] === "absent"
                          ? "bg-red-600 text-white"
                          : "bg-gray-200"
                      }
                      onClick={() => markAttendance(s.id, "absent")}
                    >
                      Absent
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* 🔹 Save Button */}
      {students.length > 0 && (
        <Button
          onClick={saveAttendance}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
        >
          Save Attendance
        </Button>
      )}
    </div>
  );
}
