"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import BackButton from "@/components/ui/BackButton";
import { useToast } from "@/components/ui/use-toast";
import { downloadAttendancePDF } from "@/components/AttendancePdf";

type Attendance = {
  id: number;
  student_name: string;
  student_roll: string;
  teacher_name: string;
  subject: string;
  joined_at: string;
  status: "Present" | "Absent";
};

type Student = {
  id: string;
  name: string;
  roll_no: string;
};

type Teacher = {
  id: string | number;
  name: string;
  subject?: string;
  google_meet_link?: string;
};

export default function AttendancePage() {
  const [records, setRecords] = useState<Attendance[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [modalStudentRoll, setModalStudentRoll] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [studentSearch, setStudentSearch] = useState<string>("");
  const [selectedTeacher, setSelectedTeacher] = useState<string>("");
  const [selectedSubject, setSelectedSubject] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalRecords, setModalRecords] = useState<Attendance[]>([]);
  const [modalStudentName, setModalStudentName] = useState("");
  const [monthFilter, setMonthFilter] = useState<string>("");

  const { toast } = useToast();

  // 🔹 Fetch data
  useEffect(() => {
    fetchStudents();
    fetchTeachers();
    fetchAttendance();
  }, []);

  const fetchStudents = async () => {
    const { data, error } = await supabase.from("students").select("id, name, roll_no");
    if (!error && data) setStudents(data);
  };

  const fetchTeachers = async () => {
    const { data, error } = await supabase
      .from("teachers")
      .select("id, name, syllabus, google_meet_link");

    if (!error && data) {
      const formatted = data.map((t) => ({
        id: t.id,
        name: t.name,
        subject: t.syllabus,
        google_meet_link: t.google_meet_link,
      }));
      setTeachers(formatted);
    }
  };

  const fetchAttendance = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("attendance")
      .select("*")
      .order("joined_at", { ascending: false });
    if (!error && data) setRecords(data);
    setLoading(false);
  };

  // 🔹 Manual Attendance
  const addAttendance = async () => {
    if (!selectedStudent || !selectedTeacher || !selectedSubject) {
      toast({
        title: "Missing Info ❌",
        description: "Please select student, teacher, and subject.",
      });
      return;
    }

    const student = students.find((s) => s.id.toString() === selectedStudent);
    const teacher = teachers.find((t) => t.id.toString() === selectedTeacher);

    if (!student || !teacher) return;

    await supabase.from("attendance").insert([
      {
        student_name: student.name,
        student_roll: student.roll_no,
        teacher_name: teacher.name,
        subject: selectedSubject,
        joined_at: new Date().toISOString(),
        status: "Present",
      },
    ]);

    setSelectedStudent("");
    setStudentSearch("");
    setSelectedTeacher("");
    setSelectedSubject("");
    fetchAttendance();
  };

  // 🔹 Google Meet Auto Attendance
  const markAttendanceByGoogleMeet = async (teacherId: string | number) => {
    if (!selectedStudent || !teacherId) {
      toast({
        title: "Missing Info ❌",
        description: "Select student first",
      });
      return;
    }

    const student = students.find((s) => s.id.toString() === selectedStudent);
    const teacher = teachers.find((t) => t.id.toString() === teacherId.toString());

    if (!student || !teacher || !teacher.google_meet_link) return;

    await supabase.from("attendance").insert([
      {
        student_name: student.name,
        student_roll: student.roll_no,
        teacher_name: teacher.name,
        subject: teacher.subject,
        joined_at: new Date().toISOString(),
        status: "Present",
      },
    ]);

    window.open(teacher.google_meet_link, "_blank");

    toast({
      title: "Attendance Marked ✅",
      description: "Present marked via Google Meet",
    });

    fetchAttendance();
  };

  // 🔹 Delete Attendance
  const deleteRecord = async (id: number) => {
    if (!confirm("Are you sure you want to delete this record?")) return;
    await supabase.from("attendance").delete().eq("id", id);
    fetchAttendance();
  };

  const clearAll = async () => {
    if (!confirm("Are you sure you want to delete all attendance?")) return;
    await supabase.from("attendance").delete().neq("id", 0);
    fetchAttendance();
  };

  // 🔹 Filtered Students
  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.roll_no.toLowerCase().includes(studentSearch.toLowerCase())
  );

  // 🔹 Modal & Month filter
  const openStudentModal = (studentName: string, studentRoll: string) => {
  setModalStudentName(studentName);
  setModalStudentRoll(studentRoll);
  setModalRecords(records.filter((r) => r.student_name === studentName));
  setMonthFilter("");
  setModalOpen(true);
};

  const filteredModalRecords = modalRecords.filter((rec) => {
    if (!monthFilter) return true;
    const recMonth = new Date(rec.joined_at).toISOString().slice(0, 7); // yyyy-mm
    return recMonth === monthFilter;
  });

  const uniqueStudents = Array.from(new Set(records.map((r) => r.student_name))).map(
    (name) => records.find((r) => r.student_name === name)!
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <BackButton href="/admin/dashboard" label="Back to Dashboard" />
        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">
          📝 Students Attendance
        </h1>

        {/* Manual Attendance */}
        <Card className="bg-white shadow-md border border-gray-300 rounded-xl">
          <CardHeader>
            <CardTitle className="text-xl text-gray-800 font-semibold">
              Mark Attendance Manually
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm text-gray-700 mb-2">Select Student</label>
                <input
                  type="text"
                  placeholder="Search by name or roll no"
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  className="w-full border border-gray-300 bg-white text-gray-900 p-3 rounded-lg mb-3 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <select
                  className="w-full border border-gray-300 bg-white text-gray-900 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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

              <div>
                <label className="block text-sm text-gray-700 mb-2">Select Teacher</label>
                <select
                  className="w-full border border-gray-300 bg-white text-gray-900 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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

              <div>
                <label className="block text-sm text-gray-700 mb-2">Select Subject</label>
                <input
                  type="text"
                  placeholder="Enter subject"
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  className="w-full border border-gray-300 bg-white text-gray-900 p-3 rounded-lg placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="flex items-end">
                <Button
                  className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg"
                  onClick={addAttendance}
                >
                  Add Attendance
                </Button>
              </div>
            </div>

            {/* Google Meet Buttons */}

          </CardContent>
        </Card>

        {/* Attendance Records */}
        <Card className="bg-white shadow-md border border-gray-300 rounded-xl">
          <CardHeader className="flex justify-between items-center">
            <CardTitle className="text-xl text-gray-800 font-semibold">
              Attendance Records
            </CardTitle>
            <Button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg" onClick={clearAll}>
              Clear All
            </Button>
          </CardHeader>

          <CardContent>
            {loading ? (
              <p className="text-center text-gray-500 py-4">Loading...</p>
            ) : records.length === 0 ? (
              <p className="text-center text-gray-500 py-6">No attendance records found.</p>
            ) : (
              <div className="overflow-x-auto mt-4 rounded-lg">
                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="bg-gray-100 text-left">
                      <th className="p-4 text-gray-800 font-semibold">Student Name</th>
                      <th className="p-4 text-gray-800 font-semibold">Roll No</th>
                      <th className="p-4 text-gray-800 font-semibold">Teacher</th>
                      <th className="p-4 text-gray-800 font-semibold">Subject</th>
                      <th className="p-4 text-gray-800 font-semibold">Join Time</th>
                      <th className="p-4 text-gray-800 font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {uniqueStudents.map((rec) => (
                      <tr key={rec.student_roll} className="border-t border-gray-200 hover:bg-gray-50 transition-colors">
                        <td className="p-4 font-medium text-gray-800">{rec.student_name}</td>
                        <td className="p-4 text-gray-700">{rec.student_roll}</td>
                        <td className="p-4 text-gray-700">{rec.teacher_name}</td>
                        <td className="p-4 text-gray-700">{rec.subject}</td>
                        <td className="p-4 text-gray-600 whitespace-nowrap">
                          {new Date(rec.joined_at).toLocaleString()}
                        </td>
                        <td className="p-4">
                          <Button
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md"
onClick={() => openStudentModal(rec.student_name, rec.student_roll)}
                          >
                            View Attendance
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

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/30 flex justify-center items-start pt-20 z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-3xl w-full p-6 relative border border-gray-300">
            <h2 className="text-xl font-bold mb-4 text-gray-800">
              {modalStudentName} - Attendance Records
            </h2>
            <div className="mb-4 flex justify-between items-center">
                <div>
                <label className="mr-2 font-medium text-gray-700">Filter by Month:</label>
                <input
                  type="month"
                  value={monthFilter}
                  onChange={(e) => setMonthFilter(e.target.value)}
                  className="border border-gray-300 bg-white text-gray-900 p-2 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
    <Button
  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg"
  onClick={() =>
    downloadAttendancePDF(
      filteredModalRecords as Attendance[],
      modalStudentName,
      modalStudentRoll
    )
  }
>
  📄 Download PDF
</Button>


            </div>
            <div className="overflow-x-auto max-h-80 rounded-lg">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-100 text-left">
                    <th className="p-3 text-gray-800 font-semibold">Teacher</th>
                    <th className="p-3 text-gray-800 font-semibold">Subject</th>
                    <th className="p-3 text-gray-800 font-semibold">Join Time</th>
                    <th className="p-3 text-gray-800 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredModalRecords.map((rec) => (
                    <tr key={rec.id} className="border-t border-gray-200 hover:bg-gray-50 transition-colors">
                      <td className="p-3 text-gray-700">{rec.teacher_name}</td>
                      <td className="p-3 text-gray-700">{rec.subject}</td>
                      <td className="p-3 text-gray-600">{new Date(rec.joined_at).toLocaleString()}</td>
                      <td className="p-3">
                        <Button
                          size="sm"
                          className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md"
                          onClick={() => deleteRecord(rec.id)}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {filteredModalRecords.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-3 text-center text-gray-500">
                        No records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <Button
              className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg"
              onClick={() => setModalOpen(false)}
            >
              Close
            </Button>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
