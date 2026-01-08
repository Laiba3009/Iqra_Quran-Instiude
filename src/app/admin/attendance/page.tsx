'use client';

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import jsPDF from "jspdf";

export default function AdminAttendancePage() {
  const { toast } = useToast();

  const [students, setStudents] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<string>("All"); // ✅ month filter

  // Load all students
  useEffect(() => {
    loadAllStudents();
  }, []);

  const loadAllStudents = async () => {
    const { data, error } = await supabase
      .from("attendance_with_details_real")
      .select("student_id, student_name, roll_no, teacher_name");

    if (error) {
      console.error(error);
      setStudents([]);
      return;
    }

    const unique: Record<string, any> = {};
    data?.forEach((s: any) => {
      if (!unique[s.student_id]) unique[s.student_id] = s;
    });
    setStudents(Object.values(unique));
  };

  const openViewModal = async (student: any) => {
    setSelectedStudent(student);
    setHistory([]);
    setSelectedMonth("All"); // reset filter
    setOpen(true);
    setLoadingHistory(true);

    const { data, error } = await supabase
      .from("attendance_with_details_real")
      .select("id, attendance_date, subject, status")
      .eq("student_id", student.student_id)
      .order("attendance_date", { ascending: false });

    setLoadingHistory(false);

    if (error) {
      console.error(error);
      setHistory([]);
      return;
    }

    setHistory(data || []);
  };

  // Filter history by selected month
  const filteredHistory = selectedMonth === "All"
    ? history
    : history.filter(h => {
        const month = new Date(h.attendance_date).toLocaleString("default", { month: "long" });
        return month === selectedMonth;
      });

  // Generate PDF
  const generatePDF = () => {
    if (!selectedStudent) return;

    const doc = new jsPDF("p", "pt");
    const today = new Date().toLocaleDateString();
    const logoUrl = "/images/logo1.jpg"; // logo in public/images
    const img = new Image();
    img.src = logoUrl;

    img.onload = () => {
      try { doc.addImage(img, "JPEG", 40, 25, 60, 60); } catch (e) { console.warn(e); }

      // Header
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(24);
      doc.text("Iqra Quran Online Institute", 120, 55);
      doc.setFontSize(14);
      doc.text("Monthly Attendance Report", 120, 75);
      doc.line(40, 95, 555, 95);

      // Info
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(12);
      doc.text(`Student: ${selectedStudent.student_name}`, 40, 115);
      doc.text(`Teacher: ${selectedStudent.teacher_name}`, 40, 135);
      doc.text(`Month: ${selectedMonth}`, 350, 115);
      doc.text(`Generated on: ${today}`, 350, 135);

      // Table header
      let y = 160;
      doc.setFont("Helvetica", "bold");
      doc.setFillColor(30, 144, 255);
      doc.rect(40, y - 12, 500, 20, "F");
      doc.setTextColor(255, 255, 255);
      doc.text("Date", 45, y);
      doc.text("Subject", 160, y);
      doc.text("Status", 350, y);
      doc.setTextColor(0, 0, 0);
      doc.setFont("Helvetica", "normal");

      // Table rows
      const subjectColors: Record<string, [number, number, number]> = {
        Quran: [173, 216, 230],
        "Islamic Studies": [230, 240, 255],
        Arabic: [232, 250, 235],
        Other: [255, 250, 230],
      };

      filteredHistory.forEach((h, idx) => {
        y += 20;
        const color = subjectColors[h.subject] || [245, 245, 245];
        doc.setFillColor(color[0], color[1], color[2]);
        doc.rect(40, y - 12, 500, 18, "F");
        doc.text(h.attendance_date, 45, y);
        doc.text(h.subject, 160, y);
        doc.setTextColor(h.status === "present" ? 0 : 200, h.status === "present" ? 128 : 0, 0);
        doc.text(h.status.toUpperCase(), 350, y);
        doc.setTextColor(0, 0, 0);
      });

      doc.save(`${selectedStudent.student_name}_Attendance_${selectedMonth}.pdf`);
    };
  };

  // Get month options from history
  const monthOptions = Array.from(new Set(history.map(h => 
    new Date(h.attendance_date).toLocaleString("default", { month: "long" })
  )));
  monthOptions.unshift("All");

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white p-8">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* Header */}
        <div className="text-center mt-13 mb-6">
          <h1 className="text-4xl font-extrabold text-blue-800  mb-2">📊 Attendance – All Students</h1>
          
          <p className="text-blue-600">View & download student attendance month wise</p>
        </div>

        {/* Students Table */}
        <Card className="shadow-lg border border-blue-200">
          <CardHeader className="bg-blue-100">
            <CardTitle className="text-xl text-blue-900 font-semibold">All Students</CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full border-collapse shadow-lg">
              <thead className="bg-blue-200 text-blue-900">
                <tr>
                  <th className="border p-2">Student</th>
                  <th className="border p-2">Roll</th>
                  <th className="border p-2">Teacher</th>
                  <th className="border p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {students.length > 0 ? students.map((s) => (
                  <tr key={s.student_id} className="hover:bg-blue-50 transition">
                    <td className="border p-2 font-medium">{s.student_name}</td>
                    <td className="border p-2">{s.roll_no}</td>
                    <td className="border p-2">{s.teacher_name}</td>
                    <td className="border p-2 text-center">
                      <Button
                        variant="outline"
                        className="hover:bg-blue-600 hover:text-white"
                        onClick={() => openViewModal(s)}
                      >
                        View Attendance
                      </Button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={4} className="text-center p-4 text-gray-500">No students found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* Attendance Modal */}
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="text-blue-800 font-bold text-xl">
                Attendance History – {selectedStudent?.student_name}
              </DialogTitle>
            </DialogHeader>

            {loadingHistory ? (
              <p className="text-center py-4 text-blue-600">Loading attendance...</p>
            ) : history.length === 0 ? (
              <p className="text-center py-4 text-gray-500">No attendance found</p>
            ) : (
              <>
                {/* Month Filter */}
                <div className="mb-3 flex items-center gap-3">
                  <label className="font-medium text-blue-800">Select Month:</label>
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="border border-blue-300 rounded px-2 py-1"
                  >
                    {monthOptions.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                {/* Attendance Table */}
                <table className="w-full border mt-3 border-blue-200">
                  <thead className="bg-blue-100 text-blue-900">
                    <tr>
                      <th className="border p-2">Date</th>
                      <th className="border p-2">Subject</th>
                      <th className="border p-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredHistory.map((h) => (
                      <tr key={h.id} className="bg-blue-50">
                        <td className="border p-2">{h.attendance_date}</td>
                        <td className="border p-2">{h.subject}</td>
                        <td className={`border p-2 font-semibold ${h.status === "present" ? "text-green-600" : "text-red-600"}`}>
                          {h.status.toUpperCase()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="mt-4 text-right">
                  <Button onClick={generatePDF} className="bg-blue-600 text-white hover:bg-blue-700">
                    Download PDF
                  </Button>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
