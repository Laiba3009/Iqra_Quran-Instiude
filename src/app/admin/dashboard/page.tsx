"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import SendNotice from "../send-notice/page";
import StudentSearchBar from "@/components/admin/StudentSearchBar";
import SyllabusHome from "@/app/student/syllabus/student/syllabus/page";
import {
  Users,
  Wallet,
  DollarSign,
  GraduationCap,
  AlertTriangle,
  Banknote,
  CreditCard,
  Calendar,
  X,
  Menu,
} from "lucide-react";

export default function AdminDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const [totalStudents, setTotalStudents] = useState(0);
  const [feesPaid, setFeesPaid] = useState(0);
  const [feesPending, setFeesPending] = useState(0);
  const [totalTeachers, setTotalTeachers] = useState(0);
  const [teacherFeeTotal, setTeacherFeeTotal] = useState(0);
  const [academyFeeTotal, setAcademyFeeTotal] = useState(0);
  const [studentFeeTotal, setStudentFeeTotal] = useState(0);

  useEffect(() => {
    const storedRole = localStorage.getItem("userRole");
    setRole(storedRole);
    fetchDashboardData();
  }, []);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  const fetchDashboardData = async () => {
    const { count: studentCount, data: students } = await supabase
      .from("students")
      .select("fee_status, academy_fee, student_total_fee", { count: "exact" });
    setTotalStudents(studentCount || 0);

    if (students) {
      const paid = students.filter((s) => s.fee_status === "paid")
        .reduce((sum, s) => sum + Number(s.student_total_fee || 0), 0);
      const pending = students.filter((s) => s.fee_status === "unpaid")
        .reduce((sum, s) => sum + Number(s.student_total_fee || 0), 0);
      const totalAcademyFee = students.reduce((sum, s) => sum + Number(s.academy_fee || 0), 0);
      const totalStudentFee = students.reduce((sum, s) => sum + Number(s.student_total_fee || 0), 0);

      setFeesPaid(paid);
      setFeesPending(pending);
      setAcademyFeeTotal(totalAcademyFee);
      setStudentFeeTotal(totalStudentFee);
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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    document.cookie = "portal_role=; path=/; max-age=0";
    localStorage.removeItem("userRole");
    localStorage.removeItem("userId");
    window.location.href = "/admin/signin";
  };

  const sidebarLinks = [
    { href: "/admin/dashboard", label: "Dashboard", icon: <Users size={18} /> },
    { href: "/admin/users", label: "Manage Users", icon: <Users size={18} /> },
    { href: "/admin/cancel-reasons", label: "Cancel Reasons", icon: <AlertTriangle size={18} /> },
    { href: "/admin/fee-approvals", label: "Fee Approvals", icon: <CreditCard size={18} /> },
    { href: "/admin/complaints", label: "Complaints", icon: <DollarSign size={18} /> },
    { href: "/admin/teacher-leave-request", label: "Teacher Leave", icon: <Calendar size={18} /> },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 w-64 h-full bg-[#001F3F] text-white transform ${
  sidebarOpen ? "translate-x-0" : "-translate-x-full"
} transition-transform duration-300 ease-in-out z-40`}
>
        <div className="flex justify-between items-center p-4 border-b border-blue-900">
          <h2 className="text-lg font-semibold">{role ? `${role} Dashboard` : "Panel"}</h2>
          <button onClick={closeSidebar} className="md:hidden hover:text-red-400"><X size={22} /></button>
        </div>
        <nav className="p-4 space-y-2 text-sm">
          {sidebarLinks.map((link) => (
            <Link key={link.href} href={link.href}
              className="flex items-center gap-2 p-2 rounded hover:bg-blue-700 transition-colors">
              {link.icon} {link.label}
            </Link>
          ))}
       
        </nav>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
  <button onClick={closeSidebar} className="absolute top-4 right-4 text-white hover:text-red-400">
    <X size={22} />
  </button>
)}

      {/* Main content */}
        <div className="flex-1 flex flex-col">

        {/* Header */}
<header className="fixed top-0 left-0 w-full bg-white shadow z-20 flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <Image src="/images/logo.png" alt="Logo" width={40} height={40} />
            <span className="font-extrabold text-[#001F3F] text-lg sm:text-xl">IQRA Quran Institute</span>
          </div>
         <button onClick={toggleSidebar} className="text-[#001F3F] z-50">
  <Menu size={28} />
</button>

        </header>

        {/* Page content */}
        <main className="mt-16 p-6 space-y-10">
          {/* Dashboard stats and buttons */}

          <h1 className="text-3xl md:text-4xl font-bold text-center text-gray-800">📊 Admin Dashboard</h1>

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
            <Link href="/admin/attendance">
              <Button className="bg-pink-600 hover:bg-pink-700">View Attendance</Button>
            </Link>
            <Link href="/admin/teacher-list">
              <Button className="bg-purple-600 hover:bg-purple-700">Teacher List</Button>
            </Link>
          </div>

          {/* Notice Board */}
          <section className="mt-10">
            <SendNotice userRole="admin" />
          </section>

          {/* Student Search */}
          <StudentSearchBar />

          {/* Syllabus */}
          <section className="mt-10">
            <SyllabusHome />
          </section>
        </main>
      </div>
    </div>
  );
}
