'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import BackButton from '@/components/ui/BackButton';

export default function TeacherList() {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadTeachers();
  }, []);

  const loadTeachers = async () => {
    setLoading(true);

    const { data: teacherData, error: teacherError } = await supabase
      .from('teachers')
      .select('*')
      .order('created_at', { ascending: false });

    if (teacherError) {
      alert(teacherError.message);
      setLoading(false);
      return;
    }

    const teachersWithStudents = await Promise.all(
      (teacherData ?? []).map(async (t: any) => {
        const { data: students } = await supabase
          .from('students')
          .select('id, name, roll_no')
          .contains('teachers', [t.email]); // Assigned teachers by email
        return { ...t, students: students ?? [] };
      })
    );

    setTeachers(teachersWithStudents);
    setLoading(false);
  };

  const toggleSalary = async (id: string, status: string) => {
    const newStatus = status === 'paid' ? 'unpaid' : 'paid';
    await supabase.from('teachers').update({ salary_status: newStatus }).eq('id', id);
    await loadTeachers();
  };

  const delTeacher = async (id: string) => {
    if (!confirm('Are you sure you want to delete this teacher?')) return;
    await supabase.from('teachers').delete().eq('id', id);
    await loadTeachers();
  };

  const calculateSalary = (teacher: any) => {
    const studentsCount = teacher.students?.length || 0;
    return (Number(teacher.salary || 0) * studentsCount); // Salary multiplied by students
  };

  return (
    <div className="max-w-6xl mx-auto mt-20 p-6 space-y-8">
      <BackButton href="/admin/dashboard" label="Back to Dashboard" />
      <h1 className="text-3xl font-bold text-green-800">Teacher List</h1>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-green-100">
                <th className="p-3">Roll No</th>
                <th className="p-3">Name</th>
                <th className="p-3">Syllabus</th>
                <th className="p-3">Salary</th>
                <th className="p-3">Status</th>
                <th className="p-3">Assigned Students</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {teachers.map((t) => (
                <tr key={t.id} className="border-t hover:bg-gray-50 transition">
                  <td className="p-3">{t.roll_no}</td>
                  <td className="p-3">{t.name}</td>
                  <td className="p-3">{Array.isArray(t.syllabus) ? t.syllabus.join(', ') : t.syllabus || '—'}</td>
                  <td className="p-3">Rs {calculateSalary(t)}</td>
                  <td className={`p-3 font-semibold ${t.salary_status === 'paid' ? 'text-green-600' : 'text-red-600'}`}>
                    {t.salary_status}
                  </td>
                  <td className="p-3">
                    {t.students && t.students.length > 0 ? (
                      <ul className="list-disc pl-5">
                        {t.students.map((s: any) => (
                          <li key={s.id}>{s.name} ({s.roll_no})</li>
                        ))}
                      </ul>
                    ) : (
                      'No students'
                    )}
                  </td>
                  <td className="p-3 flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" onClick={() => toggleSalary(t.id, t.salary_status)}>
                      {t.salary_status === 'paid' ? 'Mark Unpaid' : 'Mark Paid'}
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => delTeacher(t.id)}>
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
              {teachers.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-4 text-center text-gray-500">
                    No teachers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
