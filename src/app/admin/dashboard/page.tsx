'use client';

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import SyllabusHome from "@/app/student/syllabus/student/syllabus/page";
import StudentSearchBar from "@/components/admin/StudentSearchBar";

import {
  Users,
  Wallet,
  DollarSign,
  GraduationCap,
  CreditCard,
  AlertTriangle,
} from "lucide-react";

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
    // Students
    const { count: studentCount } = await supabase
      .from("students")
      .select("*", { count: "exact", head: true });
    setTotalStudents(studentCount || 0);

    const { data: students } = await supabase.from("students").select("student_fee, fee_status");
    if (students) {
      const paid = students
        .filter((s: any) => s.fee_status === "paid")
        .reduce((sum: number, s: any) => sum + Number(s.student_fee || 0), 0);

      const pending = students
        .filter((s: any) => s.fee_status === "unpaid")
        .reduce((sum: number, s: any) => sum + Number(s.student_fee || 0), 0);

      setFeesPaid(paid);
      setFeesPending(pending);
    }

    // Teachers
    const { count: teacherCount } = await supabase
      .from("teachers")
      .select("*", { count: "exact", head: true });
    setTotalTeachers(teacherCount || 0);

    const { data: teachers } = await supabase
      .from("teachers")
      .select("id, salary, salary_status, email");

    if (teachers) {
      // Parallel fetch of students assigned to each teacher
      const teachersWithStudents = await Promise.all(
        teachers.map(async (t: any) => {
          const { data: assignedStudents } = await supabase
            .from("students")
            .select("id")
            .contains("teachers", [t.email]); // teachers array in students table
          return { ...t, studentsCount: assignedStudents?.length || 0 };
        })
      );

      let totalPaid = 0;
      let totalPending = 0;

      teachersWithStudents.forEach((t: any) => {
        const totalSalary = Number(t.salary || 0) * t.studentsCount;
        if (t.salary_status === "paid") totalPaid += totalSalary;
        else totalPending += totalSalary;
      });

      setSalaryPaid(totalPaid);
      setSalaryPending(totalPending);
    }
  };

  return (
    <div className="space-y-10 bg-gray-50 p-6 md:p-10">
      <h1 className="text-3xl md:text-4xl font-bold text-center text-gray-800">📊 Admin Dashboard</h1>

      {/* Stats Cards */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 px-4">
        {/* Total Students */}
        <Card className="flex flex-col items-center justify-center text-center w-full max-w-xs h-40 bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg rounded-xl transition transform hover:scale-105">
          <CardHeader className="flex flex-col items-center justify-center">
            <Users className="h-8 w-8 mb-1" />
            <CardTitle className="text-lg font-semibold">Total Students</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalStudents}</p>
          </CardContent>
        </Card>

        {/* Fees Paid */}
        <Card className="flex flex-col items-center justify-center text-center w-full max-w-xs h-40 bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg rounded-xl transition transform hover:scale-105">
          <CardHeader className="flex flex-col items-center justify-center">
            <Wallet className="h-8 w-8 mb-1" />
            <CardTitle className="text-lg font-semibold">Fees Paid</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">Rs {feesPaid}</p>
          </CardContent>
        </Card>

        {/* Fees Pending */}
        <Card className="flex flex-col items-center justify-center text-center w-full max-w-xs h-40 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-lg rounded-xl transition transform hover:scale-105">
          <CardHeader className="flex flex-col items-center justify-center">
            <AlertTriangle className="h-8 w-8 mb-1" />
            <CardTitle className="text-lg font-semibold">Fees Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">Rs {feesPending}</p>
          </CardContent>
        </Card>

        {/* Total Teachers */}
        <Card className="flex flex-col items-center justify-center text-center w-full max-w-xs h-40 bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg rounded-xl transition transform hover:scale-105">
          <CardHeader className="flex flex-col items-center justify-center">
            <GraduationCap className="h-8 w-8 mb-1" />
            <CardTitle className="text-lg font-semibold">Total Teachers</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalTeachers}</p>
          </CardContent>
        </Card>

        {/* Salary Paid */}
        <Card className="flex flex-col items-center justify-center text-center w-full max-w-xs h-40 bg-gradient-to-r from-pink-300 to-pink-400 text-white shadow-lg rounded-xl transition transform hover:scale-105">
          <CardHeader className="flex flex-col items-center justify-center">
            <DollarSign className="h-8 w-8 mb-1" />
            <CardTitle className="text-lg font-semibold">Salary Paid</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">Rs {salaryPaid}</p>
          </CardContent>
        </Card>

        {/* Salary Pending */}
        <Card className="flex flex-col items-center justify-center text-center w-full max-w-xs h-40 bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg rounded-xl transition transform hover:scale-105">
          <CardHeader className="flex flex-col items-center justify-center">
            <CreditCard className="h-8 w-8 mb-1" />
            <CardTitle className="text-lg font-semibold">Salary Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">Rs {salaryPending}</p>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 justify-center">
        <Link href="/admin/progress-reports">
  <Button className="bg-teal-600 hover:bg-teal-700">View Progress Reports</Button>
</Link>

        <Link href="/admin/add-student">
          <Button className="bg-blue-600 hover:bg-blue-700">+ Add Student</Button>
        </Link>
        <Link href="/admin/add-teacher">
          <Button className="bg-green-600 hover:bg-green-700">+ Add Teacher</Button>
        </Link>
        <Link href="/admin/cancel-reasons"> <Button className="bg-red-600 hover:bg-red-700">View Cancel Reasons</Button> </Link>
        <Link href="/admin/complaints"> <Button className="bg-orange-600 hover:bg-orange-700">View Complaints</Button> </Link>
        <Link href="/admin/attendance"> <Button className="bg-pink-600 hover:bg-pink-700">View Attendance</Button> </Link>
         <Link href="/admin/fee-approvals">
         <Button className="bg-pink-600 hover:bg-pink-700">Student Fee Approvals</Button> </Link>
        <Link href="/admin/teacher-list">
          <Button className="bg-purple-600 hover:bg-purple-700">Teacher List</Button>
        </Link>
      </div>

      <StudentSearchBar />

      {/* Syllabus Section */}
      <section className="mt-10">
        <SyllabusHome />
      </section>
    </div>
  );
}
