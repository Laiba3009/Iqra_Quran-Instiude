"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import BackButton from "@/components/ui/BackButton";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useToast } from "@/components/ui/use-toast";

type Attendance = {
  id: number;
  student_name: string;
  student_roll: string;
  teacher_name: string;
  subject: string;
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
  subjects?: string[];
};

export default function AttendancePage() {
  const [records, setRecords] = useState<Attendance[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
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

  // 🔹 Fetch Students
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
    .select("id, name, syllabus"); // syllabus fetch kar rahe hain
  if (!error && data) {
    // Rename syllabus -> subject for UI
    const formatted = data.map((t) => ({
      id: t.id,
      name: t.name,
      subject: t.syllabus, // UI me 'subject' use karenge
    }));
    setTeachers(formatted);
  }
};

  // 🔹 Fetch Attendance
  const fetchAttendance = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("attendance")
      .select("*")
      .order("joined_at", { ascending: false });
    if (!error && data) setRecords(data);
    setLoading(false);
  };

  // 🔹 Add Attendance
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

    const { error } = await supabase.from("attendance").insert([
      {
        student_name: student.name,
        student_roll: student.roll_no,
        teacher_name: teacher.name,
        subject: selectedSubject,
        joined_at: new Date().toISOString(),
      },
    ]);

    if (!error) {
      setSelectedStudent("");
      setStudentSearch("");
      setSelectedTeacher("");
      setSelectedSubject("");
      fetchAttendance();
    }
  };

  // 🔹 Delete Attendance
  const deleteRecord = async (id: number) => {
    if (!confirm("Are you sure you want to delete this record?")) return;
    const { error } = await supabase.from("attendance").delete().eq("id", id);
    if (!error) fetchAttendance();
  };

  const clearAll = async () => {
    if (!confirm("Are you sure you want to delete all attendance?")) return;
    const { error } = await supabase.from("attendance").delete().neq("id", 0);
    if (!error) fetchAttendance();
  };

  // 🔹 Filter Students
  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.roll_no.toLowerCase().includes(studentSearch.toLowerCase())
  );

  // 🔹 Modal PDF Download
  const downloadModalPDF = (data: Attendance[], studentName: string) => {
    if (data.length === 0) {
      toast({
        title: "No Data ⚠️",
        description: "No attendance records to download.",
      });
      return;
    }

    const doc = new jsPDF();

    // Logo (base64) aur institute name
    const logo = "/images/logo1.jpg"; // yaha apna logo base64 paste kare
    if (logo) doc.addImage(logo, "PNG", 14, 10, 20, 20);
    doc.setFontSize(18);
    doc.text("Iqra Online Institute", 40, 20);
    doc.setFontSize(14);
    doc.text(`Attendance Report - ${studentName}`, 14, 35);
    doc.setFontSize(11);
    doc.text(`Generated On: ${new Date().toLocaleString()}`, 14, 42);

    const tableData = data.map((rec, i) => [
      i + 1,
      rec.teacher_name,
      rec.subject,
      new Date(rec.joined_at).toLocaleString(),
    ]);

    autoTable(doc, {
      head: [["#", "Teacher", "Subject", "Join Time"]],
      body: tableData,
      startY: 50,
      styles: { fontSize: 10, cellPadding: 3 },
      headStyles: { fillColor: [22, 160, 133] },
    });

    doc.save(`Attendance_${studentName}_${new Date().toISOString().split("T")[0]}.pdf`);
  };

  // 🔹 Open Modal
  const openStudentModal = (studentName: string) => {
    setModalStudentName(studentName);
    setModalRecords(records.filter((r) => r.student_name === studentName));
    setMonthFilter("");
    setModalOpen(true);
  };

  // 🔹 Filtered modal records
  const filteredModalRecords = modalRecords.filter((rec) => {
    if (!monthFilter) return true;
    const recMonth = new Date(rec.joined_at).toISOString().slice(0, 7); // yyyy-mm
    return recMonth === monthFilter;
  });

  // 🔹 Unique students for main table
  const uniqueStudents = Array.from(new Set(records.map((r) => r.student_name))).map(
    (name) => records.find((r) => r.student_name === name)!
  );

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <BackButton href="/admin/dashboard" label="Back to Dashboard" />
      <h1 className="text-3xl font-bold text-center text-green-800 mb-6">
        📝 Students Attendance
      </h1>

      {/* Manual Attendance */}
      <Card className="shadow-lg border border-green-200">
        <CardHeader>
          <CardTitle className="text-xl text-green-700 font-semibold">
            Mark Attendance Manually
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
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

            <div>
              <label className="block text-sm text-gray-700 mb-1">Select Subject</label>
              <input
                type="text"
                placeholder="Enter subject"
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="w-full border rounded-lg p-2"
              />
            </div>

            <div className="flex items-end">
              <Button
                className="w-full bg-green-600 hover:bg-green-700 text-white"
                onClick={addAttendance}
              >
                Add Attendance
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Records */}
      <Card className="shadow-lg border border-green-200">
        <CardHeader className="flex justify-between items-center">
          <CardTitle className="text-xl text-green-700 font-semibold">
            Attendance Records
          </CardTitle>
          <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={clearAll}>
            Clear All
          </Button>
        </CardHeader>

        <CardContent>
          {loading ? (
            <p className="text-center text-gray-500">Loading...</p>
          ) : records.length === 0 ? (
            <p className="text-center text-gray-500 py-4">No attendance records found.</p>
          ) : (
            <div className="overflow-x-auto mt-4">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-green-100 text-green-900">
                    <th className="p-3 text-left">Student Name</th>
                    <th className="p-3 text-left">Roll No</th>
                    <th className="p-3 text-left">Teacher</th>
                    <th className="p-3 text-left">Subject</th>
                    <th className="p-3 text-left">Join Time</th>
                    <th className="p-3 text-left">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {uniqueStudents.map((rec) => (
                    <tr key={rec.student_roll} className="border-t hover:bg-gray-50">
                      <td className="p-3 font-medium">{rec.student_name}</td>
                      <td className="p-3">{rec.student_roll}</td>
                      <td className="p-3">{rec.teacher_name}</td>
                      <td className="p-3">{rec.subject}</td>
                      <td className="p-3 text-gray-500 whitespace-nowrap">
                        {new Date(rec.joined_at).toLocaleString()}
                      </td>
                      <td className="p-3 space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openStudentModal(rec.student_name)}
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start pt-20 z-50">
          <div className="bg-white rounded-lg max-w-3xl w-full p-6 relative">
            <h2 className="text-xl font-bold mb-4">
              {modalStudentName} - Attendance Records
            </h2>
            <div className="mb-4 flex justify-between items-center">
              <div>
                <label className="mr-2 font-medium">Filter by Month:</label>
                <input
                  type="month"
                  value={monthFilter}
                  onChange={(e) => setMonthFilter(e.target.value)}
                  className="border rounded-lg p-1"
                />
              </div>
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => downloadModalPDF(filteredModalRecords, modalStudentName)}
              >
                📄 Download PDF
              </Button>
            </div>
            <div className="overflow-x-auto max-h-80">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-green-100 text-green-900">
                    <th className="p-2 text-left">Teacher</th>
                    <th className="p-2 text-left">Subject</th>
                    <th className="p-2 text-left">Join Time</th>
                    <th className="p-2 text-left">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredModalRecords.map((rec) => (
                    <tr key={rec.id} className="border-t hover:bg-gray-50">
                      <td className="p-2">{rec.teacher_name}</td>
                      <td className="p-2">{rec.subject}</td>
                      <td className="p-2">{new Date(rec.joined_at).toLocaleString()}</td>
                      <td className="p-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:bg-red-100"
                          onClick={() => deleteRecord(rec.id)}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {filteredModalRecords.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-2 text-center text-gray-500">
                        No records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <Button
              className="mt-4 bg-red-600 hover:bg-red-700 text-white"
              onClick={() => setModalOpen(false)}
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
