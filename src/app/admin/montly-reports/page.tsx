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
import autoTable from 'jspdf-autotable';

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
      console.error('Error loading monthly reports:', error);
      setLoading(false);
      return;
    }

    const formatted = (data || []).map((r: any) => ({
      id: r.id,
      student_name: r.students?.name || '—',
      roll_no: r.students?.roll_no || '—',
      teacher_name: r.teachers?.name || '—',
      report_text: r.report_text || '',
      created_at: new Date(r.created_at).toLocaleDateString(),
    }));

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
    setPopupOpen(true);
  };

  const deleteReport = async (id: string) => {
    if (!confirm('Are you sure you want to delete this report?')) return;

    const { error } = await supabase
      .from('student_monthly_reports')
      .delete()
      .eq('id', id);

    if (error) {
      alert('Error deleting report: ' + error.message);
      return;
    }

    // Refresh reports
    loadReports();
    alert('Report deleted successfully!');
  };

  const filteredReports = uniqueReports.filter((r) =>
    (r.student_name.toLowerCase() + r.roll_no.toLowerCase()).includes(search.toLowerCase())
  );

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
        } catch (err) {
          reject(err);
        }
      };
      img.onerror = () => reject(new Error('Image failed to load: ' + src));
      img.src = src;
      if (img.complete && img.naturalWidth !== 0) {
        setTimeout(() => {
          img.dispatchEvent(new Event('load'));
        }, 50);
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
      let addedLogoHeight = 0;
      try {
        const { dataUrl, mime } = await loadImageAsDataURL(LOGO_PATH);
        const format = mime.includes('png') ? 'PNG' : 'JPEG';
        const imgWidth = 60;
        const imgHeight = 60;
        doc.addImage(dataUrl, format, 40, 20, imgWidth, imgHeight);
        addedLogoHeight = imgHeight;
      } catch (imgErr) {
        console.warn('Logo load failed, continuing without logo:', imgErr);
      }

      doc.setFontSize(22);
      doc.text('Iqra Online Institute', 150, 50);

      doc.setFontSize(14);
      doc.text(`Student: ${studentAllReports[0]?.student_name}`, 40, 110);

      autoTable(doc, {
        startY: 140,
        head: [['Date', 'Teacher', 'Monthly Report']],
        body: studentAllReports.map((r) => [r.created_at, r.teacher_name, r.report_text]),
        styles: { cellWidth: 'wrap', fontSize: 10 },
        columnStyles: { 0: { cellWidth: 70 }, 1: { cellWidth: 100 }, 2: { cellWidth: 350 } },
        margin: { left: 40, right: 40 },
        didDrawPage: () => {
          const page = doc.getNumberOfPages();
          doc.setFontSize(9);
          doc.text(
            `Page ${page}`,
            doc.internal.pageSize.getWidth() - 60,
            doc.internal.pageSize.getHeight() - 30
          );
        },
      });

      const safeName = (studentAllReports[0]?.student_name || 'student').replace(/\s+/g, '_');
      doc.save(`Monthly_Reports_${safeName}.pdf`);
    } catch (err) {
      console.error('PDF generation error:', err);
      alert('Error generating PDF. Check console.');
    }
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
                      <td className="p-3 border-b text-gray-600">{r.created_at}</td>
                      <td className="p-3 border-b flex gap-2">
                        <Button onClick={() => loadStudentReports(r.roll_no)} className="bg-blue-600 text-white">
                          View
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

      {/* POPUP */}
      <Dialog open={popupOpen} onOpenChange={setPopupOpen}>
        <DialogContent className="max-w-[95vw] h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between gap-4 w-full">
              <DialogTitle>All Monthly Reports - {studentAllReports[0]?.student_name}</DialogTitle>
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

          <div className="max-h-[75vh] overflow-y-auto space-y-4 mt-4">
            {studentAllReports.map((r) => (
              <div key={r.id} className="p-4 border rounded-lg bg-gray-50">
                <p className="text-sm text-gray-600">{r.created_at}</p>
                <p className="font-semibold">{r.teacher_name}</p>
                <p className="mt-2 whitespace-pre-wrap">{r.report_text}</p>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
