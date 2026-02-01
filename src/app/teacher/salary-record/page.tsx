"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Dialog } from "@headlessui/react";
import { X } from "lucide-react";

/* ================= TYPES ================= */
interface Student {
  id: string;
  name: string;
  roll_no?: string;
  join_date?: string;
  teacher_fee?: number;
  status?: string; // ✅ ADD (for disable)
}

interface MonthlySalary {
  id: number;
  month: number;
  year: number;
  base_salary: number;
  bonus: number;
  advance: number;
  remarks?: string;
}

interface SecurityFee {
  id: number;
  month: number;
  amount: number;
}

/* ================= NEW STUDENT CHECK ================= */
const isNewStudent = (joinDate?: string) => {
  if (!joinDate) return false;

  const joined = new Date(joinDate);
  const today = new Date();

  const diffDays =
    (today.getTime() - joined.getTime()) / (1000 * 60 * 60 * 24);

  return diffDays < 30;
};

export default function TeacherSalaryRecordPage() {
  const [teacherId, setTeacherId] = useState<string | null>(null);
  const [teacherName, setTeacherName] = useState<string | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [salaryRecords, setSalaryRecords] = useState<MonthlySalary[]>([]);
  const [securityFees, setSecurityFees] = useState<SecurityFee[]>([]);
  const [agreementUrl, setAgreementUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [agreementOpen, setAgreementOpen] = useState(false);

  useEffect(() => {
    const loadTeacherData = async () => {
      setLoading(true);
      const rollNo = localStorage.getItem("teacher_roll_no");
      if (!rollNo) return alert("Login required.");

      const { data: teacherData } = await supabase
        .from("teachers")
        .select("id, name, agreement_image")
        .eq("roll_no", rollNo)
        .maybeSingle();

      if (!teacherData) {
        alert("❌ Teacher not found.");
        setLoading(false);
        return;
      }

      setTeacherId(teacherData.id);
      setTeacherName(teacherData.name);

      if (teacherData.agreement_image) {
        const { data: url } = supabase.storage
          .from("teacher_agreements")
          .getPublicUrl(teacherData.agreement_image);
        setAgreementUrl(url.publicUrl);
      }

      /* 👇 status ADD kiya */
      const { data: stData } = await supabase
        .from("student_teachers")
        .select(
          "teacher_fee, students(id, name, roll_no, join_date, status)"
        )
        .eq("teacher_id", teacherData.id);

      const formattedStudents =
        stData?.map((s: any) => ({
          id: s.students.id,
          name: s.students.name,
          roll_no: s.students.roll_no,
          join_date: s.students.join_date,
          status: s.students.status,
          teacher_fee: s.teacher_fee,
        })) || [];

      setStudents(formattedStudents);

      const { data: salData } = await supabase
        .from("monthly_salary")
        .select("*")
        .eq("teacher_id", teacherData.id)
        .order("year", { ascending: false })
        .order("month", { ascending: false });

      setSalaryRecords(salData || []);

      const { data: secData } = await supabase
        .from("security_fee")
        .select("*")
        .eq("teacher_id", teacherData.id)
        .order("month", { ascending: true });

      setSecurityFees(secData || []);
      setLoading(false);
    };

    loadTeacherData();
  }, []);

  if (loading) return <div className="p-6 text-center">Loading...</div>;
  if (!teacherId)
    return <div className="p-6 text-red-600">❌ Teacher not found.</div>;

  /* ✅ disabled hide */
  const activeStudents = students.filter(
    (s) => s.status?.toLowerCase() === "active"
  );

  /* ✅ NEW fee not counted */
  const totalStudentFee = activeStudents.reduce((total, s) => {
    if (isNewStudent(s.join_date)) return total;
    return total + Number(s.teacher_fee || 0);
  }, 0);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-blue-700">
        {teacherName} — Salary Dashboard
      </h1>

      {/* Assigned Students */}
      <div className="bg-white rounded shadow p-4">
        <h2 className="font-semibold mb-2 text-lg">Assigned Students</h2>
        <p className="mb-2">Total Fee: Rs {totalStudentFee}</p>

        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">Name</th>
              <th className="p-2 border">Roll No</th>
              <th className="p-2 border">Join Date</th>
              <th className="p-2 border">Teacher Fee</th>
            </tr>
          </thead>
          <tbody>
            {activeStudents.map((s) => (
              <tr key={s.id}>
                <td className="p-2">{s.name}</td>
                <td className="p-2">{s.roll_no || "—"}</td>
                <td className="p-2">
                  {s.join_date
                    ? new Date(s.join_date).toLocaleDateString()
                    : "—"}
                </td>
                <td className="p-2 font-medium text-purple-700">
                  {isNewStudent(s.join_date) ? (
                    <span className="text-orange-600 font-semibold">
                      NEW
                    </span>
                  ) : (
                    <>Rs {s.teacher_fee}</>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
 {/* Security Fees */}
      {securityFees.length > 0 && (
        <div className="bg-white rounded shadow p-4">
          <h2 className="font-semibold mb-2 text-lg">Security Fees</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-gray-100">
                <tr>
                  <th className="p-2 border">Month</th>
                  <th className="p-2 border">Amount</th>
                </tr>
              </thead>
              <tbody>
                {securityFees.map(s => (
                  <tr key={s.id} className="border-b hover:bg-gray-50">
                    <td className="p-2">{s.month}</td>
                    <td className="p-2 font-medium text-purple-700">Rs {s.amount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
        <div className="bg-white rounded shadow p-4">
        <h2 className="font-semibold mb-2 text-lg">Monthly Salary Records</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 border">Month/Year</th>
                <th className="p-2 border">Base</th>
                <th className="p-2 border">Bonus</th>
                <th className="p-2 border">Advance</th>
                <th className="p-2 border">Total</th>
                <th className="p-2 border">Remarks</th>
              </tr>
            </thead>
            <tbody>
               {salaryRecords.map(r => (
                <tr key={r.id} className="border-b hover:bg-gray-50">
                  <td className="p-2">{r.month}/{r.year}</td>
                  <td className="p-2">Rs {r.base_salary}</td>
                  <td className="p-2 text-green-600">Rs {r.bonus}</td>
                  <td className="p-2 text-red-600">Rs {r.advance}</td>
                  <td className="p-2 font-semibold text-purple-700">Rs {r.base_salary + r.bonus - r.advance}</td>
                  <td className="p-2">{r.remarks || "—"}</td>
                </tr>
              ))}
              {salaryRecords.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center p-4 text-gray-500">
                    No salary records.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
