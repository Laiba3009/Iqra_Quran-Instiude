'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import jsPDF from 'jspdf';

interface MonthlyReport {
  id: string;
  student_name: string;
  roll_no: string;
  teacher_name: string;
  report_text: string;
  created_at: string;
  month: string;
}

export default function AdminMonthlyReports() {
  const [reports, setReports] = useState<MonthlyReport[]>([]);
  const [uniqueReports, setUniqueReports] = useState<MonthlyReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [studentAllReports, setStudentAllReports] = useState<MonthlyReport[]>([]);
  const [popupOpen, setPopupOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState('');

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('student_monthly_reports')
      .select(`
        id,
        report_text,
        created_at,
        students ( name, roll_no ),
        teachers ( name )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    const formatted: MonthlyReport[] = (data || []).map((r: any) => {
      const dateObj = new Date(r.created_at);
      return {
        id: r.id,
        student_name: r.students?.name || '—',
        roll_no: r.students?.roll_no || '—',
        teacher_name: r.teachers?.name || '—',
        report_text: r.report_text || '',
        created_at: dateObj.toLocaleDateString(),
        month: dateObj.toLocaleString('en-US', { month: 'long', year: 'numeric' }),
      };
    });

    setReports(formatted);

    const unique = Object.values(
      formatted.reduce((acc: any, curr) => {
        acc[curr.roll_no] = acc[curr.roll_no] || curr;
        return acc;
      }, {})
    );

    setUniqueReports(unique);
    setLoading(false);
  };

  const loadStudentReports = (roll_no: string) => {
    const all = reports.filter((r) => r.roll_no === roll_no);
    setStudentAllReports(all);
    setSelectedMonth('');
    setPopupOpen(true);
  };

  const deleteReport = async (id: string) => {
    if (!confirm('Are you sure you want to delete this report?')) return;
    const { error } = await supabase.from('student_monthly_reports').delete().eq('id', id);
    if (error) return alert('Error deleting report: ' + error.message);
    loadReports();
    alert('Report deleted successfully!');
  };

  const filteredReports = uniqueReports.filter((r) =>
    (r.student_name.toLowerCase() + r.roll_no.toLowerCase()).includes(search.toLowerCase())
  );

  const filteredStudentReports = studentAllReports.filter((r) =>
    selectedMonth ? r.month === selectedMonth : true
  );

  const downloadPDF = () => {
    if (filteredStudentReports.length === 0) return alert('No report for selected month.');

    const doc = new jsPDF('p', 'pt', 'a4');

    // Light blue background
    doc.setFillColor(173, 216, 230); // light blue
    doc.rect(0, 0, doc.internal.pageSize.width, doc.internal.pageSize.height, 'F');

    // Logo
    const img = new Image();
    img.src = '/images/logo1.jpg';
    img.onload = () => {
      doc.addImage(img, 'JPEG', 40, 20, 60, 60);

      // Institute Name
      doc.setFontSize(22);
      doc.setTextColor(0, 0, 80);
      doc.text('Iqra Online Institute', 120, 50);

      // Student Info
      doc.setFontSize(16);
      doc.setTextColor(0);
      doc.text(`Student: ${filteredStudentReports[0].student_name}`, 40, 100);
      doc.text(`Roll No: ${filteredStudentReports[0].roll_no}`, 40, 120);
      doc.text(`Month: ${selectedMonth || filteredStudentReports[0].month}`, 40, 140);

      let startY = 160;
      doc.setFontSize(13);

      filteredStudentReports.forEach((r) => {
        const textLines = doc.splitTextToSize(r.report_text, 500);
        const boxHeight = Math.max(textLines.length * 14 + 20, 60);

        doc.setDrawColor(0);
        doc.setLineWidth(1);
        doc.roundedRect(40, startY, 500, boxHeight, 10, 10);

        doc.text(textLines, 50, startY + 20);

        startY += boxHeight + 10;
        if (startY > doc.internal.pageSize.getHeight() - 60) doc.addPage() && (startY = 40);
      });

      const safeName = (filteredStudentReports[0].student_name || 'student').replace(/\s+/g, '_');
      doc.save(`Monthly_Report_${safeName}.pdf`);
    };
  };

  return (
    <div className="p-6">
      <Card className="shadow-md border rounded-xl">
        <CardHeader className="flex justify-between items-center flex-wrap gap-4">
          <CardTitle className="text-xl font-semibold text-green-700">📅 Monthly Reports</CardTitle>
          <div className="flex items-center gap-2">
            <Input
              placeholder="Search by student name or roll no..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-64"
            />
            <Button onClick={loadReports} className="bg-green-600 text-white">
              Refresh
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="animate-spin text-green-600 w-6 h-6" />
            </div>
          ) : filteredReports.length === 0 ? (
            <p className="text-center text-gray-500 py-10">No monthly reports found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-200 rounded-lg">
                <thead className="bg-green-100 text-green-800">
                  <tr>
                    <th className="p-3 border-b">Student Name</th>
                    <th className="p-3 border-b">Roll No</th>
                    <th className="p-3 border-b">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReports.map((r) => (
                    <tr key={r.id} className="hover:bg-gray-50">
                      <td className="p-3 border-b font-medium">{r.student_name}</td>
                      <td className="p-3 border-b">{r.roll_no}</td>
                      <td className="p-3 border-b flex gap-2">
                        <Button
                          onClick={() => loadStudentReports(r.roll_no)}
                          className="bg-blue-600 text-white"
                        >
                          View / PDF
                        </Button>
                        <Button onClick={() => deleteReport(r.id)} className="bg-red-600 text-white">
                          <Trash2 className="w-4 h-4 mr-1" /> Delete
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

      {/* Popup */}
      <Dialog open={popupOpen} onOpenChange={setPopupOpen}>
        <DialogContent className="max-w-[650px] h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between gap-4 w-full">
              <DialogTitle>Reports - {studentAllReports[0]?.student_name}</DialogTitle>
              <div className="flex items-center gap-2">
                <Button className="bg-red-600 text-white" onClick={downloadPDF}>
                  Download PDF
                </Button>
                <Button variant="ghost" onClick={() => setPopupOpen(false)}>
                  Close
                </Button>
              </div>
            </div>
          </DialogHeader>

          {/* Month Filter inside popup */}
          <div className="mb-4">
            <select
              className="border rounded-lg p-2 w-full"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              <option value="">All Months</option>
              {[...new Set(studentAllReports.map((r) => r.month))].map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* Report Boxes */}
          <div className="space-y-4">
            {filteredStudentReports.map((r) => (
              <div key={r.id} className="p-4 border rounded-xl bg-gray-50 shadow-md">
                <p className="text-sm text-gray-600">{r.month}</p>
                <p className="mt-2 whitespace-pre-wrap">{r.report_text}</p>
              </div>
            ))}
            {filteredStudentReports.length === 0 && (
              <p className="text-center text-gray-500 py-10">No reports for selected month.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
