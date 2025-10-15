"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import BackButton from "@/components/ui/BackButton";

type Attendance = {
  id: number;
  student_name: string;
  student_roll: string;
  teacher_name: string;
  joined_at: string;
};

type Student = {
  id: number;
  name: string;
  roll_no: string;
};

type Teacher = {
  id: number;
  name: string;
};

export default function AttendancePage() {
  const [records, setRecords] = useState<Attendance[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [selectedTeacher, setSelectedTeacher] = useState<string>("");
  const [showList, setShowList] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStudents();
    fetchTeachers();
  }, []);

  // 🔹 Fetch Attendance Records
  const fetchAttendance = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("attendance")
      .select("*")
      .order("joined_at", { ascending: false });
    if (!error && data) setRecords(data);
    setLoading(false);
  };

  // 🔹 Fetch Students
  const fetchStudents = async () => {
    const { data, error } = await supabase.from("students").select("id, name, roll_no");
    if (!error && data) setStudents(data);
  };

  // 🔹 Fetch Teachers
  const fetchTeachers = async () => {
    const { data, error } = await supabase.from("teachers").select("id, name");
    if (!error && data) setTeachers(data);
  };

  // 🔹 Add Manual Attendance
  const addAttendance = async () => {
    if (!selectedStudent || !selectedTeacher) {
      alert("Please select both student and teacher.");
      return;
    }

    const student = students.find((s) => s.id.toString() === selectedStudent);
    const teacher = teachers.find((t) => t.id.toString() === selectedTeacher);

    if (!student || !teacher) return;

    const { error } = await supabase.from("attendance").insert([
      {
        student_name: student.name,
        student_roll: student.roll_no,
        teacher_name: teacher.name,
      },
    ]);

    if (error) {
      alert(error.message);
    } else {
      alert("✅ Attendance marked successfully!");
      setSelectedStudent("");
      setSelectedTeacher("");
      fetchAttendance();
    }
  };

  // 🔹 Delete Record
  const deleteRecord = async (id: number) => {
    if (!confirm("Are you sure you want to delete this record?")) return;
    const { error } = await supabase.from("attendance").delete().eq("id", id);
    if (!error) fetchAttendance();
  };

  // 🔹 Clear All
  const clearAll = async () => {
    if (!confirm("Are you sure you want to delete all attendance?")) return;
    const { error } = await supabase.from("attendance").delete().neq("id", 0);
    if (!error) fetchAttendance();
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      {/* 🔙 Back Button */}
      <BackButton href="/admin/dashboard" label="Back to Dashboard" />

      {/* 🟩 Manual Attendance Section */}
      <Card className="shadow-lg border border-green-200">
        <CardHeader>
          <CardTitle className="text-xl text-green-700 font-semibold">
            Mark Attendance Manually
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-700 mb-1">Select Student</label>
              <select
                className="w-full border rounded-lg p-2"
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
              >
                <option value="">-- Select Student --</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.roll_no})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-700 mb-1">Select Teacher</label>
              <select
                className="w-full border rounded-lg p-2"
                value={selectedTeacher}
                onChange={(e) => setSelectedTeacher(e.target.value)}
              >
                <option value="">-- Select Teacher --</option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-end">
              <Button
                className="w-full bg-green-600 hover:bg-green-700"
                onClick={addAttendance}
              >
                Add Attendance
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 🟩 Attendance View Section */}
      <Card className="shadow-lg border border-green-200">
        <CardHeader className="flex justify-between items-center">
          <CardTitle className="text-xl text-green-700 font-semibold">
            Attendance Records
          </CardTitle>
          <div className="flex gap-2">
            <Button
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => {
                if (!showList) fetchAttendance();
                setShowList(!showList);
              }}
            >
              {showList ? "Hide Attendance" : "View Attendance"}
            </Button>
            <Button
              variant="destructive"
              className="bg-red-600 hover:bg-red-700"
              onClick={clearAll}
            >
              Clear All
            </Button>
          </div>
        </CardHeader>

        {showList && (
          <CardContent>
            {loading ? (
              <p className="text-center text-gray-500">Loading...</p>
            ) : records.length === 0 ? (
              <p className="text-center text-gray-500 py-4">
                No attendance records found.
              </p>
            ) : (
              <div className="overflow-x-auto mt-4">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-green-100 text-green-900">
                      <th className="p-3 text-left">Student Name</th>
                      <th className="p-3 text-left">Roll No</th>
                      <th className="p-3 text-left">Teacher</th>
                      <th className="p-3 text-left">Join Time</th>
                      <th className="p-3 text-left">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {records.map((rec) => (
                      <tr
                        key={rec.id}
                        className="border-t hover:bg-gray-50 transition"
                      >
                        <td className="p-3 font-medium">{rec.student_name}</td>
                        <td className="p-3">{rec.student_roll}</td>
                        <td className="p-3">{rec.teacher_name}</td>
                        <td className="p-3 text-gray-500">
                          {new Date(rec.joined_at).toLocaleString()}
                        </td>
                        <td className="p-3">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:bg-red-100"
                            onClick={() => deleteRecord(rec.id)}
                          >
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        )}
      </Card>
    </div>
  );
}
