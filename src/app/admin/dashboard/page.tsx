'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import SyllabusHome from '@/app/student/syllabus/student/syllabus/page';

// ❌ Wrong: Page import
// import SyllabusHome from '@/app/student/syllabus/student/syllabus/page';

// ✅ Instead, import from components (make a component SyllabusHome.tsx inside components/)

export default function AdminDashboard() {
  const [totalStudents, setTotalStudents] = useState(0);
  const [feesPaid, setFeesPaid] = useState(0);
  const [feesPending, setFeesPending] = useState(0);
  const [totalTeachers, setTotalTeachers] = useState(0);
  const [salaryPaid, setSalaryPaid] = useState(0);
  const [salaryPending, setSalaryPending] = useState(0);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    // Total Students
    const { count: studentCount } = await supabase
      .from('students')
      .select('*', { count: 'exact', head: true });
    setTotalStudents(studentCount || 0);

    // Fees Paid / Pending
    const { data: students } = await supabase.from('students').select('student_fee, fee_status');
    if (students) {
      const paid = students
        .filter((s: any) => s.fee_status === 'paid')
        .reduce((sum: number, s: any) => sum + Number(s.student_fee || 0), 0);

      const pending = students
        .filter((s: any) => s.fee_status === 'unpaid')
        .reduce((sum: number, s: any) => sum + Number(s.student_fee || 0), 0);

      setFeesPaid(paid);
      setFeesPending(pending);
    }

    // Total Teachers
    const { count: teacherCount } = await supabase
      .from('teachers')
      .select('*', { count: 'exact', head: true });
    setTotalTeachers(teacherCount || 0);

    // Salary Paid / Pending
    const { data: teachers } = await supabase.from('teachers').select('salary, salary_status');
    if (teachers) {
      const paid = teachers
        .filter((t: any) => t.salary_status === 'paid')
        .reduce((sum: number, t: any) => sum + Number(t.salary || 0), 0);

      const pending = teachers
        .filter((t: any) => t.salary_status === 'unpaid')
        .reduce((sum: number, t: any) => sum + Number(t.salary || 0), 0);

      setSalaryPaid(paid);
      setSalaryPending(pending);
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader><CardTitle>Total Students</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{totalStudents}</p></CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Fees Paid</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">Rs {feesPaid}</p></CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Fees Pending</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">Rs {feesPending}</p></CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Total Teachers</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">{totalTeachers}</p></CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Salary Paid</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">Rs {salaryPaid}</p></CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Salary Pending</CardTitle></CardHeader>
          <CardContent><p className="text-2xl font-bold">Rs {salaryPending}</p></CardContent>
        </Card>
      </div>
      
      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <Link href="/admin/add-student">
          <Button>+ Add Student</Button>
        </Link>
        <Link href="/admin/add-teacher">
          <Button className="bg-green-600 hover:bg-green-700">+ Add Teacher</Button>
        </Link>
        <Link href="/admin/zoom-link">
          <Button className="bg-purple-600 hover:bg-purple-700">Update Zoom Link</Button>
        </Link>
        <Link href="/admin/cancel-reasons">
          <Button className="bg-red-600 hover:bg-red-700">View Cancel Reasons</Button>
        </Link>
        <Link href="/admin/complaints">
          <Button className="bg-orange-600 hover:bg-orange-700">View Complaints</Button>
        </Link>
      </div> 

      {/* Syllabus Section */}
      <div className="space-y-6">
        <section>
          <SyllabusHome />
        </section>
      </div>
    </div>
  );
}
