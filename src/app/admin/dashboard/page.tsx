'use client';

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import Link from "next/link";
import SyllabusHome from "@/app/student/syllabus/student/syllabus/page";
import SendNotice from "../send-notice/page";

import StudentSearchBar from "@/components/admin/StudentSearchBar";
import {
  Users,
  Wallet,
  DollarSign,
  GraduationCap,
  AlertTriangle,
  Banknote,
  CreditCard,
} from "lucide-react";
import Layout from "@/components/Layout";

export default function AdminDashboard() {
  const [totalStudents, setTotalStudents] = useState(0);
  const [feesPaid, setFeesPaid] = useState(0);
  const [feesPending, setFeesPending] = useState(0);
  const [totalTeachers, setTotalTeachers] = useState(0);
  const [teacherFeeTotal, setTeacherFeeTotal] = useState(0);
  const [academyFeeTotal, setAcademyFeeTotal] = useState(0);
  const [studentFeeTotal, setStudentFeeTotal] = useState(0);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    // 🧮 Students Count
    const { count: studentCount } = await supabase
      .from("students")
      .select("*", { count: "exact", head: true });
    setTotalStudents(studentCount || 0);

    // 🧮 Students Fees
    const { data: students } = await supabase
      .from("students")
      .select("fee_status, academy_fee, student_total_fee");

    if (students) {
      const paid = students
        .filter((s) => s.fee_status === "paid")
        .reduce((sum, s) => sum + Number(s.student_total_fee || 0), 0);

      const pending = students
        .filter((s) => s.fee_status === "unpaid")
        .reduce((sum, s) => sum + Number(s.student_total_fee || 0), 0);

      const totalAcademyFee = students.reduce(
        (sum, s) => sum + Number(s.academy_fee || 0),
        0
      );

      const totalStudentFee = students.reduce(
        (sum, s) => sum + Number(s.student_total_fee || 0),
        0
      );

      setFeesPaid(paid);
      setFeesPending(pending);
      setAcademyFeeTotal(totalAcademyFee);
      setStudentFeeTotal(totalStudentFee);
    }

    // 🧑‍🏫 Teachers Count
    const { count: teacherCount } = await supabase
      .from("teachers")
      .select("*", { count: "exact", head: true });
    setTotalTeachers(teacherCount || 0);

    // 💰 Total Teacher Fees from mapping table
    const { data: teacherFees } = await supabase
      .from("student_teachers")
      .select("teacher_fee");

    if (teacherFees) {
      const totalTeacherFee = teacherFees.reduce(
        (sum, t) => sum + Number(t.teacher_fee || 0),
        0
      );
      setTeacherFeeTotal(totalTeacherFee);
    }
  };

  return (
    <div className="space-y-10 bg-gray-50 p-6 md:p-10">
      <Layout>
        <h1 className="text-2xl font-bold">Welcome Admin Dashboard</h1>

      </Layout>
      <h1 className="text-3xl md:text-4xl font-bold text-center text-gray-800">
        📊 Admin Dashboard
      </h1>

      {/* Stats Cards */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 px-4">
        {/* Total Students */}
        <Card className="flex flex-col items-center justify-center text-center w-full h-40 bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg rounded-xl hover:scale-105 transition">
          <CardHeader className="flex flex-col items-center">
            <Users className="h-8 w-8 mb-1" />
            <CardTitle>Total Students</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalStudents}</p>
          </CardContent>
        </Card>

        {/* Fees Paid */}
        <Card className="flex flex-col items-center justify-center text-center w-full h-40 bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg rounded-xl hover:scale-105 transition">
          <CardHeader className="flex flex-col items-center">
            <Wallet className="h-8 w-8 mb-1" />
            <CardTitle>Fees Paid</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">Rs {feesPaid}</p>
          </CardContent>
        </Card>

        {/* Fees Pending */}
        <Card className="flex flex-col items-center justify-center text-center w-full h-40 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-lg rounded-xl hover:scale-105 transition">
          <CardHeader className="flex flex-col items-center">
            <AlertTriangle className="h-8 w-8 mb-1" />
            <CardTitle>Fees Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">Rs {feesPending}</p>
          </CardContent>
        </Card>

        {/* Total Teachers */}
        <Card className="flex flex-col items-center justify-center text-center w-full h-40 bg-gradient-to-r from-purple-500 to-purple-600 text-white shadow-lg rounded-xl hover:scale-105 transition">
          <CardHeader className="flex flex-col items-center">
            <GraduationCap className="h-8 w-8 mb-1" />
            <CardTitle>Total Teachers</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{totalTeachers}</p>
          </CardContent>
        </Card>

        {/* Total Teacher Fee */}
        <Card className="flex flex-col items-center justify-center text-center w-full h-40 bg-gradient-to-r from-pink-500 to-pink-600 text-white shadow-lg rounded-xl hover:scale-105 transition">
          <CardHeader className="flex flex-col items-center">
            <DollarSign className="h-8 w-8 mb-1" />
            <CardTitle>Total Teacher Fee</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">Rs {teacherFeeTotal}</p>
          </CardContent>
        </Card>

        {/* Academy Fee Total */}
        <Card className="flex flex-col items-center justify-center text-center w-full h-40 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white shadow-lg rounded-xl hover:scale-105 transition">
          <CardHeader className="flex flex-col items-center">
            <Banknote className="h-8 w-8 mb-1" />
            <CardTitle>Academy Fee Total</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">Rs {academyFeeTotal}</p>
          </CardContent>
        </Card>

        {/* Student Total Fee */}
        <Card className="flex flex-col items-center justify-center text-center w-full h-40 bg-gradient-to-r from-teal-500 to-teal-600 text-white shadow-lg rounded-xl hover:scale-105 transition">
          <CardHeader className="flex flex-col items-center">
            <CreditCard className="h-8 w-8 mb-1" />
            <CardTitle>Total Student Fee</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">Rs {studentFeeTotal}</p>
          </CardContent>
        </Card>
      </div>

      {/* Buttons */}
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
        <Link href="/admin/cancel-reasons">
          <Button className="bg-red-600 hover:bg-red-700">View Cancel Reasons</Button>
        </Link>
        <Link href="/admin/complaints">
          <Button className="bg-orange-600 hover:bg-orange-700">View Complaints</Button>
        </Link>
        <Link href="/admin/attendance">
          <Button className="bg-pink-600 hover:bg-pink-700">View Attendance</Button>
        </Link>
        <Link href="/admin/fee-approvals">
          <Button className="bg-pink-600 hover:bg-pink-700">Student Fee Approvals</Button>
        </Link>
        <Link href="/admin/teacher-list">
          <Button className="bg-purple-600 hover:bg-purple-700">Teacher List</Button>
        </Link><Link href="/admin/teacher-leave-request">
          <Button className="bg-blue-800 hover:bg-blue-700">Teacher Leave Request </Button>
        </Link>
      </div>
      {/* Notice Board Section */}
<section className="mt-10">
  <SendNotice userRole="admin" />
</section>


      <StudentSearchBar />

      <section className="mt-10">
        <SyllabusHome />
      </section>
    </div>
  );
}
