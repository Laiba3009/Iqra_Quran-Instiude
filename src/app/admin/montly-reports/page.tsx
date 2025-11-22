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

  try {
    // --- Logo ---
    try {
      const { dataUrl, mime } = await loadImageAsDataURL(LOGO_PATH);
      const format = mime.includes('png') ? 'PNG' : 'JPEG';
      doc.addImage(dataUrl, format, 40, 20, 60, 60);
    } catch (e) { console.warn('Logo failed', e); }

    // --- Institute Name ---
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(22);
    doc.setTextColor('#2f855a');
    doc.text('Iqra Online Institute', doc.internal.pageSize.getWidth() / 2, 50, { align: 'center' });

    // --- Student Info ---
    doc.setFillColor('#f9fafb'); // light gray
    doc.roundedRect(35, 90, doc.internal.pageSize.getWidth() - 70, 70, 5, 5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor('#1e293b');
    doc.text('Student Information', 50, 110);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.text(`Name: ${studentAllReports[0]?.student_name}`, 50, 130);
    doc.text(`Roll No: ${studentAllReports[0]?.roll_no}`, 50, 150);
    doc.text(`Teacher: ${studentAllReports[0]?.teacher_name}`, 300, 130);
    doc.text(`Month: ${selectedMonth}`, 300, 150);

    // --- Monthly Report Box ---
    let startY = 180;
    doc.setFillColor('#f0fdf4'); // light green
    doc.roundedRect(35, startY, doc.internal.pageSize.getWidth() - 70, 400, 5, 5, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20); // H4 size
    doc.setTextColor('#065f46');
    doc.text('Monthly Report', doc.internal.pageSize.getWidth() / 2, startY + 25, { align: 'center' });

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(18); // H4-ish text size for report content
    doc.setTextColor('#1e293b');

    const combinedText = filteredPopupReports.map(r => r.report_text).join('\n\n');
    const wrappedText = doc.splitTextToSize(combinedText, doc.internal.pageSize.getWidth() - 90);
    doc.text(wrappedText, 50, startY + 50);

    const safeName = (studentAllReports[0]?.student_name || 'student').replace(/\s+/g, '_');
    doc.save(`Monthly_Report_${safeName}.pdf`);

  } catch (err) { 
    console.error(err); 
    alert('Error generating PDF. Check console.'); 
  }
};


  return (
    <div className="p-6">
      {/* Main Table */}
      <Card className="shadow-md border rounded-xl">
        <CardHeader className="flex justify-between items-center flex-wrap gap-4">
          <CardTitle className="text-xl font-semibold text-green-700">📅 Monthly Reports</CardTitle>
          <div className="flex items-center gap-2">
            <Input placeholder="Search by student name or roll no..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-64" />
            <Button onClick={loadReports} className="bg-green-600 text-white">Refresh</Button>
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
