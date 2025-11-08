'use client';

import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';

// Cookie helper
function getCookie(name: string) {
  if (typeof document === 'undefined') return '';
  return document.cookie.split('; ').reduce((r, v) => {
    const parts = v.split('=');
    return parts[0].trim() === name ? decodeURIComponent(parts[1]) : r;
  }, '');
}

interface AttendanceRecord {
  id: string;
  date: string;
  status: string;
  student_name: string;
  roll_no: string;
  class_time: string;
  teacher_name: string;
}

export default function AttendanceList({ teacherId: initialTeacherId }: { teacherId?: string }) {
  const [teacherId, setTeacherId] = useState<string | null>(initialTeacherId || null);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState('');
  const { toast } = useToast();
  const router = useRouter();

  // ✅ Only set teacherId if not already set
  useEffect(() => {
    if (!teacherId) {
      const tid = getCookie('current_teacher_id');
      if (tid) setTeacherId(tid);
      else {
        toast({ title: 'Error', description: 'No teacher ID found. Please log in again.' });
        router.push('/teacher/login');
      }
    }
  }, [teacherId, router, toast]);

  // Load Attendance
  const loadAttendance = useCallback(async () => {
    if (!teacherId) return;
    setLoading(true);

    try {
      let query = supabase
        .from('attendance_with_details')
        .select('*')
        .eq('teacher_id', teacherId)
        .order('date', { ascending: false });

      if (selectedMonth) {
        const [year, month] = selectedMonth.split('-');
        const start = `${year}-${month}-01`;
        const end = `${year}-${month}-31`;
        query = query.gte('date', start).lte('date', end);
      }

      const { data, error } = await query;
      if (error) throw error;

      setRecords(data || []);
    } catch (err: any) {
      toast({ title: 'Error', description: `Failed to load attendance: ${err.message}` });
    } finally {
      setLoading(false);
    }
  }, [teacherId, selectedMonth, toast]);

  // ✅ Only run when teacherId or month changes
  useEffect(() => {
    if (teacherId) loadAttendance();
  }, [teacherId, loadAttendance]);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this record?')) return;
    const { error } = await supabase.from('tsattendance').delete().eq('id', id);
    if (error) toast({ title: 'Error', description: error.message });
    else {
      setRecords(prev => prev.filter(r => r.id !== id));
      toast({ title: 'Deleted ✅', description: 'Record removed successfully.' });
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-md border">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-green-800">📋 Attendance Records</h2>
        <Button
          variant="outline"
          onClick={() => router.push('/teacher/dashboard')}
          className="border-green-600 text-green-700 hover:bg-green-50"
        >
          ← Back to Dashboard
        </Button>
      </div>

      <div className="flex items-center gap-3 mb-6">
        <label className="font-medium text-gray-700">Filter by Month:</label>
        <input
          type="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="border border-gray-300 rounded-md p-2"
        />
        {selectedMonth && (
          <Button onClick={() => setSelectedMonth('')} className="bg-gray-200 text-gray-700 hover:bg-gray-300">
            Clear
          </Button>
        )}
      </div>

      {loading ? (
        <p className="text-center text-gray-500 py-8">Loading attendance...</p>
      ) : records.length === 0 ? (
        <p className="text-center text-gray-500 py-8">No attendance found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 rounded-lg">
            <thead className="bg-green-100 text-green-800">
              <tr>
                <th className="p-3 border-b">Student</th>
                <th className="p-3 border-b">Roll No</th>
                <th className="p-3 border-b">Class Time</th>
                <th className="p-3 border-b">Date</th>
                <th className="p-3 border-b">Status</th>
                <th className="p-3 border-b">Teacher</th>
                <th className="p-3 border-b text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {records.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50 border-b">
                  <td className="p-3">{r.student_name}</td>
                  <td className="p-3">{r.roll_no}</td>
                  <td className="p-3">{r.class_time}</td>
                  <td className="p-3 text-sm text-gray-600">{r.date}</td>
                  <td className={`p-3 font-semibold ${r.status === 'present' ? 'text-green-600' : 'text-red-600'}`}>
                    {r.status}
                  </td>
                  <td className="p-3">{r.teacher_name}</td>
                  <td className="p-3 text-center">
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(r.id)}>
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
