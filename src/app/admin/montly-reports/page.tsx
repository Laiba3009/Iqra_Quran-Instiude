'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

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
  const [filteredReports, setFilteredReports] = useState<MonthlyReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadReports();
  }, []);

  // 🔹 Load all monthly reports
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
    setFilteredReports(formatted);
    setLoading(false);
  };

  // 🔹 Search filter
  useEffect(() => {
    if (!search.trim()) {
      setFilteredReports(reports);
    } else {
      const term = search.toLowerCase();
      setFilteredReports(
        reports.filter(
          (r) =>
            r.student_name.toLowerCase().includes(term) ||
            r.teacher_name.toLowerCase().includes(term) ||
            r.roll_no.toLowerCase().includes(term)
        )
      );
    }
  }, [search, reports]);

  return (
    <div className="p-6">
      <Card className="shadow-md border rounded-xl">
        <CardHeader className="flex justify-between items-center flex-wrap gap-4">
          <CardTitle className="text-xl font-semibold text-green-700">
            📅 Monthly Reports
          </CardTitle>
          <div className="flex items-center gap-2">
            <Input
              placeholder="Search by name, roll no, or teacher..."
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
            <p className="text-center text-gray-500 py-10">
              No monthly reports found.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-200 rounded-lg">
                <thead className="bg-green-100 text-green-800">
                  <tr>
                    <th className="p-3 border-b">Student Name</th>
                    <th className="p-3 border-b">Roll No</th>
                    <th className="p-3 border-b">Teacher</th>
                    <th className="p-3 border-b">Date</th>
                    <th className="p-3 border-b w-2/5">Monthly Report</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReports.map((r) => (
                    <tr key={r.id} className="hover:bg-gray-50">
                      <td className="p-3 border-b font-medium">{r.student_name}</td>
                      <td className="p-3 border-b">{r.roll_no}</td>
                      <td className="p-3 border-b text-gray-700">{r.teacher_name}</td>
                      <td className="p-3 border-b text-gray-600">{r.created_at}</td>
                      <td className="p-3 border-b text-gray-700 whitespace-pre-wrap">
                        {r.report_text}
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
