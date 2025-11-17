'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface Attendance {
  id: string;
  student_name: string;
  roll_no: string;
  class_time: string;
  teacher_name: string;
  status: string;
  date: string;
}

export default function ViewAttendance() {
  const [attendanceList, setAttendanceList] = useState<Attendance[]>([]);
  const [uniqueStudents, setUniqueStudents] = useState<string[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
  const [studentAttendance, setStudentAttendance] = useState<Attendance[]>([]);
  const [month, setMonth] = useState<string>(String(new Date().getMonth() + 1).padStart(2, '0'));
  const [open, setOpen] = useState(false);

  useEffect(() => {
    loadAttendance();
  }, [month]); // ✅ reload automatically when month changes

  const loadAttendance = async () => {
    const year = new Date().getFullYear();
    const startDate = `${year}-${month}-01`;
    const endDateObj = new Date(year, parseInt(month), 0);
    const endDate = `${year}-${month}-${String(endDateObj.getDate()).padStart(2, '0')}`;

    const { data, error } = await supabase
      .from('tsattendance_view')
      .select('*')
      .gte('date', startDate)
      .lte('date', endDate)
      .order('date', { ascending: false });

    if (!error && data) {
      setAttendanceList(data);
      const unique = Array.from(new Set(data.map((d) => d.student_name)));
      setUniqueStudents(unique);
    }
  };

  const handleView = (name: string) => {
    setSelectedStudent(name);
    const records = attendanceList.filter((a) => a.student_name === name);
    setStudentAttendance(records);
    setOpen(true);
  };

  // ✅ PDF Download
  const handleDownloadPDF = async () => {
    const doc = new jsPDF();

    const logoPath = '/images/logo1.jpg';
    const imgData = await fetch(logoPath)
      .then((res) => res.blob())
      .then(
        (blob) =>
          new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(blob);
          })
      );

    doc.addImage(imgData, 'JPEG', 15, 10, 25, 25);
    doc.setFontSize(16);
    doc.text('Iqra Online Quran Institute', 45, 25);

    doc.setFontSize(12);
    doc.text(`Attendance Report - ${selectedStudent}`, 15, 45);

    const tableData = studentAttendance.map((a) => [
      a.roll_no,
      a.teacher_name,
      a.class_time,
      a.status,
      a.date,
    ]);

    autoTable(doc, {
      startY: 50,
      head: [['Roll No', 'Teacher', 'Class Time', 'Status', 'Date']],
      body: tableData,
    });

    doc.save(`${selectedStudent}_Attendance.pdf`);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-center">📋 Student Attendance Summary</h1>

      <div className="overflow-x-auto bg-white shadow rounded-lg border">
        <table className="min-w-full border-collapse border border-gray-200">
          <thead className="bg-blue-100 text-blue-800 text-center">
            <tr>
              <th className="p-3 border-b">Student Name</th>
              <th className="p-3 border-b">Action</th>
            </tr>
          </thead>
          <tbody>
            {uniqueStudents.length ? (
              uniqueStudents.map((name) => (
                <tr key={name} className="hover:bg-gray-50 text-center">
                  <td className="p-3 border-b">{name}</td>
                  <td className="p-3 border-b">
                    <Button
                      size="sm"
                      onClick={() => handleView(name)}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      View Attendance
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={2} className="p-4 text-gray-500 text-center">
                  No attendance found for this month.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ✅ Popup Attendance Details */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <div className="flex justify-between items-center w-full">
              <DialogTitle>
                Attendance for <strong>{selectedStudent}</strong>
              </DialogTitle>

              <div className="flex gap-3 items-center">
                {/* month selector */}
                <select
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  className="border p-2 rounded text-sm"
                >
                  {[...Array(12).keys()].map((i) => {
                    const m = String(i + 1).padStart(2, '0');
                    return (
                      <option key={m} value={m}>
                        {new Date(0, i).toLocaleString('en', { month: 'long' })}
                      </option>
                    );
                  })}
                </select>

                {/* download button */}
                <Button
                  onClick={handleDownloadPDF}
                  className="bg-green-600 hover:bg-green-700 text-white text-sm"
                >
                  📄 Download PDF
                </Button>
              </div>
            </div>
          </DialogHeader>

          <div className="overflow-x-auto mt-4">
            <table className="min-w-full border border-gray-200 text-sm">
              <thead className="bg-green-100 text-green-800 text-center">
                <tr>
                  <th className="p-2 border-b">Roll No</th>
                  <th className="p-2 border-b">Teacher</th>
                  <th className="p-2 border-b">Class Time</th>
                  <th className="p-2 border-b">Status</th>
                  <th className="p-2 border-b">Date</th>
                </tr>
              </thead>
              <tbody>
                {studentAttendance.length ? (
                  studentAttendance.map((a) => (
                    <tr key={a.id} className="hover:bg-gray-50 text-center">
                      <td className="p-2 border-b">{a.roll_no}</td>
                      <td className="p-2 border-b">{a.teacher_name}</td>
                      <td className="p-2 border-b">{a.class_time}</td>
                      <td
                        className={`p-2 border-b font-medium ${
                          a.status === 'present' ? 'text-green-600' : 'text-red-600'
                        }`}
                      >
                        {a.status}
                      </td>
                      <td className="p-2 border-b">{a.date}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center p-4 text-gray-500">
                      No attendance found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
