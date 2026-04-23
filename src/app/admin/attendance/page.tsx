'use client';

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import jsPDF from "jspdf";

export default function AdminAttendancePage() {
  const [students, setStudents] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [selectedMonth, setSelectedMonth] = useState("All");

  useEffect(() => {
    loadAllStudents();
  }, []);

  const loadAllStudents = async () => {
    const { data } = await supabase
      .from("attendance_with_details_real")
      .select("student_id, student_name, roll_no, teacher_name");

    const unique: any = {};
    data?.forEach((s: any) => {
      unique[s.student_id] = s;
    });

    setStudents(Object.values(unique));
  };

  const openViewModal = async (student: any) => {
    setSelectedStudent(student);
    setOpen(true);
    setSelectedMonth("All");

    const { data } = await supabase
      .from("attendance_with_details_real")
      .select("id, attendance_date, subject, status")
      .eq("student_id", student.student_id)
      .order("attendance_date", { ascending: false });

    setHistory(data || []);
  };

  const filteredHistory =
    selectedMonth === "All"
      ? history
      : history.filter((h) =>
          new Date(h.attendance_date).toLocaleString("default", {
            month: "long",
          }) === selectedMonth
        );

  const totalPresent = filteredHistory.filter((h) => h.status === "present").length;
  const totalAbsent = filteredHistory.filter((h) => h.status === "absent").length;

 const generatePDF = () => {
  if (!selectedStudent) return;

  const doc = new jsPDF("p", "pt");
  const today = new Date().toLocaleDateString();
  const img = new Image();
  img.src = "/images/logo1.jpg";

  img.onload = () => {
    try {
      doc.addImage(img, "JPEG", 40, 25, 60, 60);
    } catch (e) {}

    // HEADER
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(20);
    doc.text("Iqra Quran Online Institute", 120, 50);

    doc.setFontSize(13);
    doc.text("Monthly Attendance Report", 120, 70);

    doc.line(40, 90, 555, 90);

    // INFO SECTION (FIXED SPACING)
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(11);

    let infoY = 110;

    doc.text(`Student: ${selectedStudent.student_name}`, 40, infoY);
    doc.text(`Month: ${selectedMonth}`, 350, infoY);

    infoY += 20;
    doc.text(`Teacher: ${selectedStudent.teacher_name}`, 40, infoY);
    doc.text(`Generated: ${today}`, 350, infoY);

    // ✅ STATS PROPERLY BELOW (NO OVERLAP)
    infoY += 25;
    doc.setFont("Helvetica", "bold");
    doc.text(`Present: ${totalPresent}`, 40, infoY);
    doc.text(`Absent: ${totalAbsent}`, 180, infoY);

    // TABLE START POSITION (SAFE GAP)
    let y = infoY + 30;

    // TABLE HEADER
    doc.setFont("Helvetica", "bold");
    doc.setFillColor(30, 144, 255);
    doc.rect(40, y - 12, 500, 20, "F");

    doc.setTextColor(255, 255, 255);
    doc.text("Date", 45, y);
    doc.text("Subject", 170, y);
    doc.text("Status", 350, y);

    doc.setTextColor(0, 0, 0);
    doc.setFont("Helvetica", "normal");

    // ROWS
    filteredHistory.forEach((h) => {
      y += 20;

      doc.text(h.attendance_date, 45, y);
      doc.text(h.subject, 170, y);

      if (h.status === "present") {
        doc.setTextColor(0, 128, 0);
      } else {
        doc.setTextColor(200, 0, 0);
      }

      doc.text(h.status.toUpperCase(), 350, y);
      doc.setTextColor(0, 0, 0);
    });

    doc.save(`${selectedStudent.student_name}_Attendance_${selectedMonth}.pdf`);
  };
};

  const monthOptions = [
    "All",
    ...Array.from(
      new Set(
        history.map((h) =>
          new Date(h.attendance_date).toLocaleString("default", {
            month: "long",
          })
        )
      )
    ),
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">

      {/* HEADER FIX */}
      <h1 className="text-3xl font-bold text-blue-800 text-center mt-10 mb-6">
        Attendance System
      </h1>

      {/* TABLE */}
      <div className="bg-white shadow rounded-lg p-4">
        <table className="w-full border">
          <thead className="bg-blue-100">
            <tr>
              <th className="border p-2">Student</th>
              <th className="border p-2">Roll</th>
              <th className="border p-2">Teacher</th>
              <th className="border p-2">Action</th>
            </tr>
          </thead>

          <tbody>
            {students.map((s) => (
              <tr key={s.student_id}>
                <td className="border p-2">{s.student_name}</td>
                <td className="border p-2">{s.roll_no}</td>
                <td className="border p-2">{s.teacher_name}</td>
                <td className="border p-2 text-center">
                  <button
                    onClick={() => openViewModal(s)}
                    className="bg-blue-600 text-white px-3 py-1 rounded"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL (DIV BASED, PERFECT SCROLL) */}
      {open && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">

          <div className="w-full max-w-5xl h-[85vh] bg-white rounded-xl flex flex-col overflow-hidden">

            {/* HEADER */}
            <div className="p-4 border-b bg-blue-50 flex justify-between">
              <div>
                <h2 className="font-bold text-blue-800">
                  {selectedStudent?.student_name}
                </h2>
                <p className="text-sm text-gray-500">Attendance Report</p>
              </div>

              <button onClick={() => setOpen(false)}>✕</button>
            </div>

            {/* BODY SCROLL */}
            <div className="flex-1 overflow-y-auto p-4">

              {/* FILTER */}
              <div className="mb-3 flex gap-3 items-center">
                <label>Month:</label>

                <select
                  className="border p-1"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                >
                  {monthOptions.map((m) => (
                    <option key={m}>{m}</option>
                  ))}
                </select>
              </div>

              {/* STATS */}
              <div className="flex gap-4 mb-3">
                <div className="bg-green-100 px-3 py-1 rounded">
                  Present: {totalPresent}
                </div>
                <div className="bg-red-100 px-3 py-1 rounded">
                  Absent: {totalAbsent}
                </div>
              </div>

              {/* TABLE */}
              <table className="w-full border">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border p-2">Date</th>
                    <th className="border p-2">Subject</th>
                    <th className="border p-2">Status</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredHistory.map((h) => (
                    <tr key={h.id}>
                      <td className="border p-2">{h.attendance_date}</td>
                      <td className="border p-2">{h.subject}</td>
                      <td className="border p-2">{h.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* FOOTER */}
            <div className="p-4 border-t text-right">
              <Button onClick={generatePDF}>
                Download PDF
              </Button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}