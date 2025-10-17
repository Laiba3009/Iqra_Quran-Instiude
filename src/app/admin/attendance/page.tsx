'use client';

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
  const [studentSearch, setStudentSearch] = useState<string>("");
  const [selectedTeacher, setSelectedTeacher] = useState<string>("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchStudents();
    fetchTeachers();
    fetchAttendance(); // Always load attendance
  }, []);

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
      setStudentSearch("");
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

  // 🔹 Filter students based on search input
  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.roll_no.toLowerCase().includes(studentSearch.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <BackButton href="/admin/dashboard" label="Back to Dashboard" />
      <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-center text-gray-800 mb-6">
        📝 Students Attendance
      </h1>
      {/* Manual Attendance Section */}
      <Card className="shadow-lg border border-green-200">
        <CardHeader>
          <CardTitle className="text-xl text-green-700 font-semibold">
            Mark Attendance Manually
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            {/* Student Search + Select */}
            <div>
              <label className="block text-sm text-gray-700 mb-1">Select Student</label>
              <input
                type="text"
                placeholder="Search by name or roll no"
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                className="w-full border rounded-lg p-2 mb-2"
              />
              <select
                className="w-full border rounded-lg p-2"
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
              >
                <option value="">-- Select Student --</option>
                {filteredStudents.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.roll_no})
                  </option>
                ))}
              </select>
            </div>

            {/* Teacher Select */}
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

            {/* Add Attendance Button */}
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

      {/* Attendance Records Section (always visible) */}
      <Card className="shadow-lg border border-green-200">
        <CardHeader className="flex justify-between items-center">
          <CardTitle className="text-xl text-green-700 font-semibold">
            Attendance Records
          </CardTitle>
          <Button
            variant="destructive"
            className="bg-red-600 hover:bg-red-700"
            onClick={clearAll}
          >
            Clear All
          </Button>
        </CardHeader>

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
      </Card>
    </div>
  );
}
