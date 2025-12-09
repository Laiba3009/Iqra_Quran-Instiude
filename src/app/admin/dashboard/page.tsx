"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import SendNotice from "../send-notice/page";
import StudentSearchBar from "@/components/admin/StudentSearchBar";
import { Users, Wallet, DollarSign, GraduationCap, AlertTriangle, Banknote, CreditCard, UserX } from "lucide-react";
import RoleBasedLayout from "@/components/RoleBasedLayout";

// ✅ TypeScript Interfaces
interface Student {
  id: string;
  name: string;
  roll_no: string;
  contact?: string;
  email?: string;
  courses?: string[];
  fee_status: string;
  academy_fee?: number;
  student_total_fee?: number;
  join_date?: string; // important
  status?: string; // ✅ added for disabled students
}

export default function AdminDashboard() {
  const [role, setRole] = useState<string | null>(null);
  const [totalStudents, setTotalStudents] = useState(0);
  const [feesPaid, setFeesPaid] = useState(0);
  const [feesPending, setFeesPending] = useState(0);
  const [totalTeachers, setTotalTeachers] = useState(0);
  const [teacherFeeTotal, setTeacherFeeTotal] = useState(0);
  const [disabledStudentsCount, setDisabledStudentsCount] = useState(0); 

  const [academyFeeTotal, setAcademyFeeTotal] = useState(0);
  const [studentFeeTotal, setStudentFeeTotal] = useState(0);
  const [newStudentsCount, setNewStudentsCount] = useState(0);

  useEffect(() => {
    const storedRole = localStorage.getItem("userRole");
    setRole(storedRole);
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    const { count: studentCount, data: students } = await supabase
      .from("students")
      .select("fee_status, academy_fee, student_total_fee, join_date, status", { count: "exact" }); // ✅ added status
    setTotalStudents(studentCount || 0);

    if (students) {
      const paid = students
        .filter((s) => s.fee_status === "paid")
        .reduce((sum, s) => sum + Number(s.student_total_fee || 0), 0);
      const pending = students
        .filter((s) => s.fee_status === "unpaid")
        .reduce((sum, s) => sum + Number(s.student_total_fee || 0), 0);
      const totalAcademyFee = students.reduce((sum, s) => sum + Number(s.academy_fee || 0), 0);
      const totalStudentFee = students.reduce((sum, s) => sum + Number(s.student_total_fee || 0), 0);

      setFeesPaid(paid);
      setFeesPending(pending);
      setAcademyFeeTotal(totalAcademyFee);
      setStudentFeeTotal(totalStudentFee);
      

      // ✅ New Students in last 30 days
      const today = new Date();
      const newStudents = students.filter((s) => {
        if (!s.join_date) return false;
        const joinDate = new Date(s.join_date);
        const diffInDays = (today.getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 24);
        return diffInDays <= 30;
      });
      setNewStudentsCount(newStudents.length);

      const disabledStudents = students.filter((s) => s.status === "disabled"); // ✅ now works
      setDisabledStudentsCount(disabledStudents.length);
    }

    const { count: teacherCount, data: teacherFees } = await supabase
      .from("teachers")
      .select("*, student_teachers(teacher_fee)", { count: "exact" });
    setTotalTeachers(teacherCount || 0);

    if (teacherFees) {
      const totalTeacherFee = teacherFees
        .flatMap((t: any) => t.student_teachers || [])
        .reduce((sum, t) => sum + Number(t.teacher_fee || 0), 0);
      setTeacherFeeTotal(totalTeacherFee);
    }
  };

  return (
    <RoleBasedLayout role="admin">
      <h1 className="text-3xl md:text-4xl font-bold text-center text-gray-800">📊 Admin Dashboard</h1>

      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 px-4 mt-6">
        {/* Cards */}
        <Card className="flex flex-col items-center justify-center text-center w-full h-40 bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg rounded-xl hover:scale-105 transition">
          <CardHeader className="flex flex-col items-center">
            <Users className="h-8 w-8 mb-1" />
            <CardTitle>Total Students</CardTitle>
          </CardHeader>
          <CardContent><p className="text-2xl font-bold">{totalStudents}</p></CardContent>
        </Card>

        <Card className="flex flex-col items-center justify-center text-center w-full h-40 bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg rounded-xl hover:scale-105 transition">
          <CardHeader className="flex flex-col items-center">
            <Wallet className="h-8 w-8 mb-1" />
            <CardTitle>Fees Paid</CardTitle>
          </CardHeader>
          <CardContent><p className="text-2xl font-bold">Rs {feesPaid}</p></CardContent>
        </Card>

        <Card className="flex flex-col items-center justify-center text-center w-full h-40 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-lg rounded-xl hover:scale-105 transition">
          <CardHeader className="flex flex-col items-center">
            <AlertTriangle className="h-8 w-8 mb-1" />
            <CardTitle>Fees Pending</CardTitle>
          </CardHeader>
          <CardContent><p className="text-2xl font-bold">Rs {feesPending}</p></CardContent>
        </Card>

        <Card className="flex flex-col items-center justify-center text-center w-full h-40 bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg rounded-xl hover:scale-105 transition">
          <CardHeader className="flex flex-col items-center">
            <GraduationCap className="h-8 w-8 mb-1" />
            <CardTitle>Total Teachers</CardTitle>
          </CardHeader>
          <CardContent><p className="text-2xl font-bold">{totalTeachers}</p></CardContent>
        </Card>

        <Card className="flex flex-col items-center justify-center text-center w-full h-40 bg-gradient-to-r from-pink-500 to-pink-600 text-white shadow-lg rounded-xl hover:scale-105 transition">
          <CardHeader className="flex flex-col items-center">
            <DollarSign className="h-8 w-8 mb-1" />
            <CardTitle>Total Teacher Fee</CardTitle>
          </CardHeader>
          <CardContent><p className="text-2xl font-bold">Rs {teacherFeeTotal}</p></CardContent>
        </Card>

        <Card className="flex flex-col items-center justify-center text-center w-full h-40 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-lg rounded-xl hover:scale-105 transition">
          <CardHeader className="flex flex-col items-center">
            <Banknote className="h-8 w-8 mb-1" />
            <CardTitle>Academy Fee Total</CardTitle>
          </CardHeader>
          <CardContent><p className="text-2xl font-bold">Rs {academyFeeTotal}</p></CardContent>
        </Card>

        <Card className="flex flex-col items-center justify-center text-center w-full h-40 bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-lg rounded-xl hover:scale-105 transition">
          <CardHeader className="flex flex-col items-center">
            <CreditCard className="h-8 w-8 mb-1" />
            <CardTitle>Total Student Fee</CardTitle>
          </CardHeader>
          <CardContent><p className="text-2xl font-bold">Rs {studentFeeTotal}</p></CardContent>
        </Card>

        <Card className="flex flex-col items-center justify-center text-center w-full h-40 bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg rounded-xl hover:scale-105 transition">
          <CardHeader className="flex flex-col items-center">
            <Users className="h-8 w-8 mb-1" />
            <CardTitle>New Students (Last 30 Days)</CardTitle>
          </CardHeader>
          <CardContent><p className="text-2xl font-bold">{newStudentsCount}</p></CardContent>
        </Card>

        <Card className="flex flex-col items-center justify-center text-center w-full h-40 bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-lg rounded-xl hover:scale-105 transition">
          <CardHeader className="flex flex-col items-center">
            <UserX className="h-8 w-8 mb-1" />
            <CardTitle>Disabled Students</CardTitle>
          </CardHeader>
          <CardContent><p className="text-2xl font-bold">{disabledStudentsCount}</p></CardContent>
        </Card>
      </div>

      {/* Buttons */}
      <div className="flex flex-wrap gap-3 justify-center mt-6">
        <Link href="/admin/progress-reports"><Button className="bg-teal-600 hover:bg-teal-700">Weekly Reports + Notice</Button></Link>
        <Link href="/admin/add-student"><Button className="bg-blue-600 hover:bg-blue-700">+ Add Student</Button></Link>
        <Link href="/admin/add-teacher"><Button className="bg-green-600 hover:bg-green-700">+ Add Teacher</Button></Link>
        <Link href="/admin/attendance"><Button className="bg-pink-600 hover:bg-pink-700">View Attendance</Button></Link>
        <Link href="/admin/teacher-list"><Button className="bg-purple-600 hover:bg-purple-700">Teacher List</Button></Link>
        <Link href="/admin/teacher-attendance"><Button className="bg-pink-600 hover:bg-pink-700">Teacher Attendance</Button></Link>
      </div>

      {/* Notice Board */}
      <section className="mt-10">
        <SendNotice userRole="admin" />
      </section>

      {/* Student Search */}
      <StudentSearchBar />
    </RoleBasedLayout>
  );
}
