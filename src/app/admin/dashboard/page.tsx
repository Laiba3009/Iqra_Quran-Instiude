"use client";
import RoleBasedLayout from "@/components/RoleBasedLayout";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import SendNotice from "../send-notice/page";
import StudentSearchBar from "@/components/admin/StudentSearchBar";
import { Users, Wallet, DollarSign, GraduationCap, AlertTriangle, Banknote, CreditCard, UserX } from "lucide-react";

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

  const [studentsData, setStudentsData] = useState<Student[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalStudents, setModalStudents] = useState<Student[]>([]);

  useEffect(() => {
    const storedRole = localStorage.getItem("userRole");
    setRole(storedRole);
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    const { count: studentCount, data: students } = await supabase
      .from("students")
      .select("id, name, roll_no, fee_status, academy_fee, student_total_fee, join_date, status", { count: "exact" });
    setTotalStudents(studentCount || 0);

    if (students) {
      setStudentsData(students as Student[]);

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

      const today = new Date();
      const newStudents = students.filter((s) => s.join_date && ((today.getTime() - new Date(s.join_date).getTime()) / (1000*60*60*24) <= 30));
      setNewStudentsCount(newStudents.length);

      const disabledStudents = students.filter((s) => s.status === "disabled");
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

  const handleCardClick = (type: "new" | "disabled") => {
    const today = new Date();
    if (type === "new") {
      const newStudents = studentsData.filter((s) => s.join_date && ((today.getTime() - new Date(s.join_date).getTime()) / (1000*60*60*24) <= 30));
      setModalStudents(newStudents);
      setModalTitle("New Students (Last 30 Days)");
    } else {
      const disabledStudents = studentsData.filter((s) => s.status === "disabled");
      setModalStudents(disabledStudents);
      setModalTitle("Disabled Students");
    }
    setShowModal(true);
  };

  return (
    <RoleBasedLayout role="admin">
      <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      

          <h1 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-8">📊 Admin Dashboard</h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Total Students */}
          <Card className="flex flex-col items-center justify-center text-center w-full h-40 bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg rounded-xl hover:scale-[1.02] transition-all duration-300 border border-blue-400">
            <CardHeader className="flex flex-col items-center">
              <Users className="h-10 w-10 mb-2" />
              <CardTitle className="text-lg font-semibold">Total Students</CardTitle>
            </CardHeader>
            <CardContent><p className="text-4xl font-bold">{totalStudents}</p></CardContent>
          </Card>

          {/* Fees Paid */}
          <Card className="flex flex-col items-center justify-center text-center w-full h-40 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg rounded-xl hover:scale-[1.02] transition-all duration-300 border border-emerald-400">
            <CardHeader className="flex flex-col items-center">
              <Wallet className="h-10 w-10 mb-2" />
              <CardTitle className="text-lg font-semibold">Fees Paid</CardTitle>
            </CardHeader>
            <CardContent><p className="text-4xl font-bold">Rs {feesPaid}</p></CardContent>
          </Card>

          {/* Fees Pending */}
          <Card className="flex flex-col items-center justify-center text-center w-full h-40 bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-lg rounded-xl hover:scale-[1.02] transition-all duration-300 border border-amber-400">
            <CardHeader className="flex flex-col items-center">
              <AlertTriangle className="h-10 w-10 mb-2" />
              <CardTitle className="text-lg font-semibold">Fees Pending</CardTitle>
            </CardHeader>
            <CardContent><p className="text-4xl font-bold">Rs {feesPending}</p></CardContent>
          </Card>

          {/* Total Teachers */}
          <Card className="flex flex-col items-center justify-center text-center w-full h-40 bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-lg rounded-xl hover:scale-[1.02] transition-all duration-300 border border-indigo-400">
            <CardHeader className="flex flex-col items-center">
              <GraduationCap className="h-10 w-10 mb-2" />
              <CardTitle className="text-lg font-semibold">Total Teachers</CardTitle>
            </CardHeader>
            <CardContent><p className="text-4xl font-bold">{totalTeachers}</p></CardContent>
          </Card>

          {/* Total Teacher Fee */}
          <Card className="flex flex-col items-center justify-center text-center w-full h-40 bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-lg rounded-xl hover:scale-[1.02] transition-all duration-300 border border-purple-400">
            <CardHeader className="flex flex-col items-center">
              <DollarSign className="h-10 w-10 mb-2" />
              <CardTitle className="text-lg font-semibold">Total Teacher Fee</CardTitle>
            </CardHeader>
            <CardContent><p className="text-4xl font-bold">Rs {teacherFeeTotal}</p></CardContent>
          </Card>

          {/* Academy Fee Total */}
          <Card className="flex flex-col items-center justify-center text-center w-full h-40 bg-gradient-to-br from-cyan-500 to-cyan-600 text-white shadow-lg rounded-xl hover:scale-[1.02] transition-all duration-300 border border-cyan-400">
            <CardHeader className="flex flex-col items-center">
              <Banknote className="h-10 w-10 mb-2" />
              <CardTitle className="text-lg font-semibold">Academy Fee Total</CardTitle>
            </CardHeader>
            <CardContent><p className="text-4xl font-bold">Rs {academyFeeTotal}</p></CardContent>
          </Card>

          {/* Total Student Fee */}
          <Card className="flex flex-col items-center justify-center text-center w-full h-40 bg-gradient-to-br from-teal-500 to-teal-600 text-white shadow-lg rounded-xl hover:scale-[1.02] transition-all duration-300 border border-teal-400">
            <CardHeader className="flex flex-col items-center">
              <CreditCard className="h-10 w-10 mb-2" />
              <CardTitle className="text-lg font-semibold">Total Student Fee</CardTitle>
            </CardHeader>
            <CardContent><p className="text-4xl font-bold">Rs {studentFeeTotal}</p></CardContent>
          </Card>

          {/* New Students (clickable) */}
          <div className="cursor-pointer" onClick={() => handleCardClick("new")}>
            <Card className="flex flex-col items-center justify-center text-center w-full h-40 bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg rounded-xl hover:scale-[1.02] transition-all duration-300 border border-green-400">
              <CardHeader className="flex flex-col items-center">
                <Users className="h-10 w-10 mb-2" />
                <CardTitle className="text-lg font-semibold">New Students (Last 30 Days)</CardTitle>
              </CardHeader>
              <CardContent><p className="text-4xl font-bold">{newStudentsCount}</p></CardContent>
            </Card>
          </div>

          {/* Disabled Students (clickable) */}
          <div className="cursor-pointer" onClick={() => handleCardClick("disabled")}>
            <Card className="flex flex-col items-center justify-center text-center w-full h-40 bg-gradient-to-br from-slate-500 to-slate-600 text-white shadow-lg rounded-xl hover:scale-[1.02] transition-all duration-300 border border-slate-400">
              <CardHeader className="flex flex-col items-center">
                <UserX className="h-10 w-10 mb-2" />
                <CardTitle className="text-lg font-semibold">Disabled Students</CardTitle>
              </CardHeader>
              <CardContent><p className="text-4xl font-bold">{disabledStudentsCount}</p></CardContent>
            </Card>
          </div>
        </div>

        <div className="mt-8 max-w-4xl mx-auto bg-white rounded-xl p-6 border border-gray-300 shadow-md">
          <StudentSearchBar />
        </div>

        {/* Buttons */}
        <div className="flex flex-wrap justify-center gap-4 mt-8">
          <Link href="/admin/progress-reports">
            <Button className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-3 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg">
              Weekly Reports + Notice
            </Button>
          </Link>
          <Link href="/admin/add-student">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg">
              + Add Student
            </Button>
          </Link>
          <Link href="/admin/add-teacher">
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg">
              + Add Teacher
            </Button>
          </Link>
          <Link href="/admin/attendance">
            <Button className="bg-rose-600 hover:bg-rose-700 text-white px-6 py-3 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg">
              View Attendance
            </Button>
          </Link>
          <Link href="/admin/teacher-list">
            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg">
              Teacher List
            </Button>
          </Link>
          <Link href="/admin/teacher-attendance">
            <Button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg">
              Teacher Attendance
            </Button>
          </Link>
        </div>

        {/* Notice Board */}
        <section className="mt-10 max-w-4xl mx-auto">
          <SendNotice />
        </section>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl h-[70vh] p-6 overflow-y-auto relative border border-gray-300">
              <button
                className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 text-2xl font-bold bg-gray-100 hover:bg-gray-200 rounded-full w-8 h-8 flex items-center justify-center transition-colors"
                onClick={() => setShowModal(false)}
              >
                &times;
              </button>
              <h2 className="text-2xl font-bold mb-4 text-center text-gray-800">{modalTitle}</h2>
              <ul className="space-y-3">
                {modalStudents.map((s) => (
                  <li key={s.id} className="p-4 border rounded-lg flex justify-between bg-gray-50 border-gray-200 hover:bg-gray-100 transition-colors">
                    <span className="text-gray-700">{s.name} ({s.roll_no})</span>
                    <span className={`font-medium ${s.status === 'disabled' ? 'text-red-600' : 'text-green-600'}`}>
                      {s.status || "Active"}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
        </div>
    </RoleBasedLayout>
  );
}