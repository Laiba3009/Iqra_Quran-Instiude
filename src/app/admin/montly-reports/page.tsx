'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import jsPDF from 'jspdf';

interface MonthlyReport {
  id: string;
  student_name: string;
  roll_no: string;
  teacher_name: string;
  report_text: string;
  created_at: string;
}

export default function AdminMonthlyReports() {
  const [reports, setReports] = useState<MonthlyReport[]>([]);
  const [uniqueReports, setUniqueReports] = useState<MonthlyReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [studentAllReports, setStudentAllReports] = useState<MonthlyReport[]>([]);
  const [popupOpen, setPopupOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState('All');

  useEffect(() => { loadReports(); }, []);

  const loadReports = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('student_monthly_reports')
      .select(`id, report_text, created_at, students(name, roll_no), teachers(name)`)
      .order('created_at', { ascending: false });

    if (error) { console.error(error); setLoading(false); return; }

    const formatted = (data || []).map((r: any) => ({
      id: r.id,
      student_name: r.students?.name || '—',
      roll_no: r.students?.roll_no || '—',
      teacher_name: r.teachers?.name || '—',
      report_text: r.report_text || '',
      created_at: r.created_at,
    }));

    setReports(formatted);
    const unique = Object.values(formatted.reduce((acc: any, curr) => {
      acc[curr.roll_no] = acc[curr.roll_no] || curr;
      return acc;
    }, {}));
    setUniqueReports(unique);
    setLoading(false);
  };

  const loadStudentReports = (roll_no: string) => {
    const all = reports.filter((r) => r.roll_no === roll_no);
    setStudentAllReports(all);
    setSelectedMonth('All');
    setPopupOpen(true);
  };

  const deleteReport = async (id: string) => {
    if (!confirm('Are you sure you want to delete this report?')) return;

    const { error } = await supabase
      .from('student_monthly_reports')
      .delete()
      .eq('id', id);

    if (error) { alert('Error deleting report: ' + error.message); return; }

    // Refresh reports and popup
    loadReports();
    setStudentAllReports(prev => prev.filter(r => r.id !== id));
    alert('Report deleted successfully!');
  };

  const filteredReports = uniqueReports.filter((r) =>
    (r.student_name.toLowerCase() + r.roll_no.toLowerCase()).includes(search.toLowerCase())
  );

  const filteredPopupReports = studentAllReports.filter(r => {
    if (selectedMonth === 'All') return true;
    return new Date(r.created_at).toLocaleString('default', { month: 'long' }) === selectedMonth;
  });

  const loadImageAsDataURL = (src: string): Promise<{ dataUrl: string; mime: string }> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth;
          canvas.height = img.naturalHeight;
          const ctx = canvas.getContext('2d');
          if (!ctx) throw new Error('Canvas not supported');
          ctx.drawImage(img, 0, 0);
          let mime = 'image/jpeg';
          if (src.match(/\.png(\?.*)?$/i)) mime = 'image/png';
          if (src.match(/\.webp(\?.*)?$/i)) mime = 'image/webp';
          const dataUrl = canvas.toDataURL(mime);
          resolve({ dataUrl, mime });
        } catch (err) { reject(err); }
      };
      img.onerror = () => reject(new Error('Image failed to load: ' + src));
      img.src = src;
      if (img.complete && img.naturalWidth !== 0) {
        setTimeout(() => { img.dispatchEvent(new Event('load')); }, 50);
      }
    });
  };

const downloadPDF = async () => {
  if (!studentAllReports || studentAllReports.length === 0) {
    alert('No report selected.');
    return;
  }

  const LOGO_PATH = '/images/logo1.jpg';
  const doc = new jsPDF('p', 'pt', 'a4');

  // ✅ Attendance fetch FIX
  const { data: attendanceData } = await supabase
    .from("attendance_with_details_real")
    .select("status, attendance_date")
    .eq("roll_no", studentAllReports[0]?.roll_no);

  const safeAttendance = attendanceData || [];

  const filteredAttendance =
    selectedMonth === "All"
      ? safeAttendance
      : safeAttendance.filter((a: any) =>
          new Date(a.attendance_date).toLocaleString("default", {
            month: "long",
          }) === selectedMonth
        );

  const totalPresent = filteredAttendance.filter(
    (a: any) => a.status?.toLowerCase() === "present"
  ).length;

  const totalAbsent = filteredAttendance.filter(
    (a: any) => a.status?.toLowerCase() === "absent"
  ).length;

  try {
    // ✅ LOGO
    try {
      const { dataUrl, mime } = await loadImageAsDataURL(LOGO_PATH);
      const format = mime.includes('png') ? 'PNG' : 'JPEG';
      doc.addImage(dataUrl, format, 40, 20, 60, 60);
    } catch (e) {}

    // ✅ TITLE
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.text('Iqra Online Institute', 300, 50, { align: 'center' });

    // ✅ STUDENT INFO BOX
    doc.setFillColor(245, 247, 250);
    doc.roundedRect(35, 90, 520, 70, 6, 6, 'F');

    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');

    doc.text(`Name: ${studentAllReports[0]?.student_name}`, 50, 115);
    doc.text(`Roll No: ${studentAllReports[0]?.roll_no}`, 50, 135);
    doc.text(`Teacher: ${studentAllReports[0]?.teacher_name}`, 300, 115);
    doc.text(`Month: ${selectedMonth}`, 300, 135);

    // ✅ ATTENDANCE BOX (FIXED POSITION)
    let y = 180;

    doc.setFillColor(220, 252, 231);
    doc.roundedRect(35, y, 520, 60, 6, 6, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('Attendance Summary', 50, y + 20);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);

    doc.text(`Total Present: ${totalPresent}`, 50, y + 40);
    doc.text(`Total Absent: ${totalAbsent}`, 250, y + 40);

    // ✅ MONTHLY REPORT BOX (NO OVERLAP)
    let startY = y + 80;

    doc.setFillColor(240, 253, 244);
    doc.roundedRect(35, startY, 520, 400, 6, 6, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(18);
    doc.text('Monthly Report', 300, startY + 25, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);

    const combinedText = filteredPopupReports
      .map(r => r.report_text)
      .join('\n\n');

    const wrappedText = doc.splitTextToSize(combinedText, 480);

    doc.text(wrappedText, 50, startY + 50);

    // ✅ SAVE
    const safeName = (studentAllReports[0]?.student_name || 'student')
      .replace(/\s+/g, '_');

    doc.save(`Monthly_Report_${safeName}.pdf`);

  } catch (err) {
    console.error(err);
    alert('PDF error');
  }
};


  return (
<div className="p-6 pt-12 bg-gray-50 min-h-screen">      {/* Main Table */}
      <Card className="shadow-md border mt-6 rounded-xl">
     <CardHeader className="space-y-4">

  <CardTitle className="text-2xl font-bold text-green-700">
    📅 Monthly Reports
  </CardTitle>

  <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
    
    <Input
      placeholder="Search by student name or roll no..."
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      className="w-full sm:w-64"
    />

    <Button onClick={loadReports} className="bg-green-600 text-white">
      Refresh
    </Button>

  </div>

</CardHeader>

        <CardContent>
          {loading ? (
            <div className="flex justify-center py-10"><Loader2 className="animate-spin text-green-600 w-6 h-6" /></div>
          ) : filteredReports.length === 0 ? (
            <p className="text-center text-gray-500 py-10">No monthly reports found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-200 rounded-lg">
                <thead className="bg-green-100 text-green-800">
                  <tr>
                    <th className="p-3 border-b">Student Name</th>
                    <th className="p-3 border-b">Roll No</th>
                    <th className="p-3 border-b">Teacher</th>
                    <th className="p-3 border-b">Date</th>
                    <th className="p-3 border-b">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReports.map((r) => (
                    <tr key={r.id} className="hover:bg-gray-50">
                      <td className="p-3 border-b font-medium">{r.student_name}</td>
                      <td className="p-3 border-b">{r.roll_no}</td>
                      <td className="p-3 border-b text-gray-700">{r.teacher_name}</td>
                      <td className="p-3 border-b text-gray-600">{new Date(r.created_at).toLocaleDateString()}</td>
                      <td className="p-3 border-b flex gap-2">
                        <Button onClick={() => loadStudentReports(r.roll_no)} className="bg-blue-600 text-white">View</Button>
                        <Button onClick={() => deleteReport(r.id)} className="bg-red-600 text-white"><Trash2 className="w-4 h-4 mr-1" /> Delete</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Popup */}
      <Dialog open={popupOpen} onOpenChange={setPopupOpen}>
        <DialogContent className="max-w-[95vw] h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 w-full">
              <DialogTitle>All Monthly Reports - {studentAllReports[0]?.student_name}</DialogTitle>
              <div className="flex items-center gap-2">
                <select className="border rounded px-2 py-1" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
                  <option>All</option>
                  {Array.from(new Set(studentAllReports.map(r => new Date(r.created_at).toLocaleString('default', { month: 'long' })))).map(m => (
                    <option key={m}>{m}</option>
                  ))}
                </select>
                <Button className="bg-red-600 text-white" onClick={downloadPDF}>Download PDF</Button>
                <Button variant="ghost" onClick={() => setPopupOpen(false)}>Close</Button>
              </div>
            </div>
          </DialogHeader>

          <div className="max-h-[75vh] overflow-y-auto space-y-4 mt-4">
            {filteredPopupReports.map((r) => (
       <div key={r.id} className="p-4 border rounded-lg bg-gray-50 flex justify-between items-start">
  <div>
    <p className="text-sm text-gray-600">{new Date(r.created_at).toLocaleDateString()}</p>
    <p className="font-semibold">{r.teacher_name}</p>
    <p className="mt-2 whitespace-pre-wrap">{r.report_text}</p>
  </div>

  <Button
    onClick={() => deleteReport(r.id)}
    className="ml-4 h-8 w-8 p-0 flex items-center justify-center bg-red-600 text-white rounded"
  >
    <Trash2 className="w-4 h-4" />
  </Button>
</div>


            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
