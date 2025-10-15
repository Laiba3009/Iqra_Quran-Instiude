"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import SyllabusHome from "@/app/student/syllabus/student/syllabus/page";
import StudentSearchBar from "@/components/admin/StudentSearchBar";

// 🖼 Icons
import {
  Users,
  Wallet,
  DollarSign,
  GraduationCap,
  CreditCard,
  AlertTriangle,
} from "lucide-react";

// ✅ Import your components
import AttendanceTable from "@/components/AttendanceTable";


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
      .from("students")
      .select("*", { count: "exact", head: true });
    setTotalStudents(studentCount || 0);

    // Fees Paid / Pending
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

    // Total Teachers
    const { count: teacherCount } = await supabase
      .from("teachers")
      .select("*", { count: "exact", head: true });
    setTotalTeachers(teacherCount || 0);

    // Salary Paid / Pending
    const { data: teachers } = await supabase.from("teachers").select("salary, salary_status");
    if (teachers) {
      const paid = teachers
        .filter((t: any) => t.salary_status === "paid")
        .reduce((sum: number, t: any) => sum + Number(t.salary || 0), 0);

      const pending = teachers
        .filter((t: any) => t.salary_status === "unpaid")
        .reduce((sum: number, t: any) => sum + Number(t.salary || 0), 0);

      setSalaryPaid(paid);
      setSalaryPending(pending);
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-center p-10">📊 Admin Dashboard</h1>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Total Students */}
        <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Total Students</CardTitle>
            <Users className="h-8 w-8" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalStudents}</p>
          </CardContent>
        </Card>

        {/* Fees Paid */}
        <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Fees Paid</CardTitle>
            <Wallet className="h-8 w-8" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">Rs {feesPaid}</p>
          </CardContent>
        </Card>

        {/* Fees Pending */}
        <Card className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Fees Pending</CardTitle>
            <AlertTriangle className="h-8 w-8" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">Rs {feesPending}</p>
          </CardContent>
        </Card>

        {/* Total Teachers */}
        <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Total Teachers</CardTitle>
            <GraduationCap className="h-8 w-8" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{totalTeachers}</p>
          </CardContent>
        </Card>

        {/* Salary Paid */}
        <Card className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Salary Paid</CardTitle>
            <DollarSign className="h-8 w-8" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">Rs {salaryPaid}</p>
          </CardContent>
        </Card>

        {/* Salary Pending */}
        <Card className="bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Salary Pending</CardTitle>
            <CreditCard className="h-8 w-8" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">Rs {salaryPending}</p>
          </CardContent>
        </Card>
      </div>
            <div>
             </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 justify-center">
        <Link href="/admin/add-student">
          <Button className="bg-blue-600 hover:bg-blue-700">+ Add Student</Button>
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
        <Link href="/admin/attendance">
          <Button className="bg-pink-600 hover:bg-pink-700">View Attendance</Button>
        </Link>
      </div>

          <StudentSearchBar />

    

        {/* Syllabus Section */}
        <section>
        
          <SyllabusHome />

        </section>
    </div>
  );
}
