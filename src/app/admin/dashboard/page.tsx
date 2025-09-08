'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import GradesPage from '@/app/student/syllabus/student/syllabus/grades/page';
import HadithPage from '@/app/student/syllabus/student/syllabus/hadith/page';
import IslamicStudiesPage from '@/app/student/syllabus/student/syllabus/islamic-studies/page';
import SyllabusHome from '@/app/student/syllabus/student/syllabus/page';

// syllabus imports


export default function AdminDashboard() {
  const [totalStudents, setTotalStudents] = useState(0);
  const [feesPaid, setFeesPaid] = useState(0);
  const [feesPending, setFeesPending] = useState(0);
  const [totalTeachers, setTotalTeachers] = useState(0);
  const [salaryPaid, setSalaryPaid] = useState(0);
  const [salaryPending, setSalaryPending] = useState(0);

  useEffect(() => { fetchDashboardData(); }, []);

  const fetchDashboardData = async () => {
    const { count: studentCount } = await supabase.from('students').select('*', { count: 'exact', head: true });
    setTotalStudents(studentCount || 0);

    const { data: students } = await supabase.from('students').select('student_fee');
    if (students) {
      const paid = students.filter((s:any) => Number(s.student_fee) > 0).length;
      const pending = students.length - paid;
      setFeesPaid(paid);
      setFeesPending(pending);
    }

    const { count: teacherCount } = await supabase.from('teachers').select('*', { count: 'exact', head: true });
    setTotalTeachers(teacherCount || 0);

    const { data: teachers } = await supabase.from('teachers').select('salary');
    if (teachers) {
      const paid = teachers.filter((t:any) => Number(t.salary) > 0).length;
      const pending = teachers.length - paid;
      setSalaryPaid(paid);
      setSalaryPending(pending);
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card><CardHeader><CardTitle>Total Students</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{totalStudents}</p></CardContent></Card>
        <Card><CardHeader><CardTitle>Fees Paid</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{feesPaid}</p></CardContent></Card>
        <Card><CardHeader><CardTitle>Fees Pending</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{feesPending}</p></CardContent></Card>
        <Card><CardHeader><CardTitle>Total Teachers</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{totalTeachers}</p></CardContent></Card>
        <Card><CardHeader><CardTitle>Salary Paid</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{salaryPaid}</p></CardContent></Card>
        <Card><CardHeader><CardTitle>Salary Pending</CardTitle></CardHeader><CardContent><p className="text-2xl font-bold">{salaryPending}</p></CardContent></Card>
      </div>
      
      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <Link href="/admin/add-student"><Button>+ Add Student</Button></Link>
        <Link href="/admin/add-teacher"><Button className="bg-green-600 hover:bg-green-700">+ Add Teacher</Button></Link>
        <Link href="/admin/zoom-link"><Button className="bg-purple-600 hover:bg-purple-700">Update Zoom Link</Button></Link>
      </div>

      {/* Syllabus Sections */}
      <div className="space-y-6">
        <section>
          <SyllabusHome />
        </section>

       
      </div>
    </div>
  );
}
