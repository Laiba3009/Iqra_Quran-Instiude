"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Dialog } from "@headlessui/react";
import { X } from "lucide-react";

interface Student {
  id: string;
  name: string;
  roll_no?: string;
  join_date?: string;
  teacher_fee?: number;
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

      const { data: teacherData, error: teacherError } = await supabase
        .from("teachers")
        .select("id, name, agreement_image")
        .eq("roll_no", rollNo)
        .maybeSingle();

      if (teacherError || !teacherData) {
        alert("❌ Teacher not found.");
        setLoading(false);
        return;
      }

      setTeacherId(teacherData.id);
      setTeacherName(teacherData.name);

      if (teacherData.agreement_image) {
        const { data: url } = supabase
          .storage
          .from("teacher_agreements")
          .getPublicUrl(teacherData.agreement_image);
        setAgreementUrl(url.publicUrl);
      }

      const { data: stData } = await supabase
        .from("student_teachers")
        .select("teacher_fee, students(id, name, roll_no, join_date)")
        .eq("teacher_id", teacherData.id);

      const formattedStudents =
        stData?.map((s: any) => ({
          id: s.students.id,
          name: s.students.name,
          roll_no: s.students.roll_no,
          join_date: s.students.join_date,
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
  if (!teacherId) return <div className="p-6 text-red-600">❌ Teacher not found.</div>;

  const totalStudentFee = students.reduce((a, b) => a + (b.teacher_fee || 0), 0);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-blue-700">{teacherName} — Salary Dashboard</h1>

      {/* Agreement Button & Modal */}
      {agreementUrl && (
        <>
          <div className="bg-white p-4 rounded shadow flex items-center justify-between">
            <h2 className="font-semibold text-lg">Agreement</h2>
            <button
              onClick={() => setAgreementOpen(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              View Agreement
            </button>
          </div>

          <Dialog open={agreementOpen} onClose={() => setAgreementOpen(false)} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <Dialog.Panel className="bg-white rounded-lg max-w-md w-full p-4 relative">
              <button
                onClick={() => setAgreementOpen(false)}
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              >
                <X />
              </button>
              <Dialog.Title className="font-bold text-lg mb-4">Agreement Image</Dialog.Title>
              <img src={agreementUrl} alt="Agreement" className="w-full border rounded" />
            </Dialog.Panel>
          </Dialog>
        </>
      )}

      {/* Assigned Students */}
      <div className="bg-white rounded shadow p-4">
        <h2 className="font-semibold mb-2 text-lg">Assigned Students</h2>
        <p className="mb-2">Total Fee: Rs {totalStudentFee}</p>
        <div className="overflow-x-auto">
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
              {students.map(s => (
                <tr key={s.id} className="border-b hover:bg-gray-50">
                  <td className="p-2">{s.name}</td>
                  <td className="p-2">{s.roll_no || "—"}</td>
                  <td className="p-2">{s.join_date ? new Date(s.join_date).toLocaleDateString() : "—"}</td>
                  <td className="p-2 font-medium text-purple-700">Rs {s.teacher_fee}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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

      {/* Monthly Salary Records */}
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
