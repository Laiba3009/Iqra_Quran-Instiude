'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import BackButton from '@/components/ui/BackButton';

export default function ProgressReportsPage() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from('student_progress')
      .select(`
        id,
        report_text,
        created_at,
        students:student_id (id, name, roll_no),
        teachers:teacher_id (id, name)
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error loading reports:', error);
    } else {
      setReports(data ?? []);
    }

    setLoading(false);
  };

  return (
    <div className="max-w-6xl mx-auto mt-16 p-6 space-y-6">
      <BackButton href="/admin/dashboard" label="Back to Dashboard" />
      <h1 className="text-3xl font-bold text-green-800 text-center">
        Student Progress Reports
      </h1>

      {loading ? (
        <p className="text-center text-gray-500">Loading...</p>
      ) : reports.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-green-100">
                <th className="p-3">Date</th>
                <th className="p-3">Student</th>
                <th className="p-3">Roll No</th>
                <th className="p-3">Teacher</th>
                <th className="p-3">Progress Report</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((r) => (
                <tr key={r.id} className="border-t hover:bg-gray-50 transition">
                  <td className="p-3">
                    {new Date(r.created_at).toLocaleDateString()}
                  </td>
                  <td className="p-3">{r.students?.name || '—'}</td>
                  <td className="p-3">{r.students?.roll_no || '—'}</td>
                  <td className="p-3">{r.teachers?.name || '—'}</td>
                  <td className="p-3 text-gray-700">{r.report_text}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-center text-gray-500">
          No progress reports found yet.
        </p>
      )}
    </div>
  );
}
