"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import SalaryAddForm from "@/components/SalaryAddForm";
import TeacherSalarySnapshotModal from "@/components/TeacherSalarySnapshotModal";

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

export default function TeacherSalaryPage() {
  const { teacherId } = useParams();

  const [teacher, setTeacher] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [salaryRecords, setSalaryRecords] = useState<any[]>([]);
  const [security, setSecurity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [showAddSalary, setShowAddSalary] = useState(false);
  const [showSecurity, setShowSecurity] = useState(false);
  const [viewRecord, setViewRecord] = useState<any>(null);

  const [secMonth, setSecMonth] = useState(new Date().getMonth() + 1);
  const [secYear, setSecYear] = useState(new Date().getFullYear());
  const [secAmount, setSecAmount] = useState("");

  const isNewStudent = (joinDate: string | null) => {
  if (!joinDate) return false;

  const joined = new Date(joinDate);
  const today = new Date();

  const diffDays =
    (today.getTime() - joined.getTime()) / (1000 * 60 * 60 * 24);

  return diffDays < 30;
};

  // ---------------- FETCH DATA ----------------
  const fetchAll = async () => {
    setLoading(true);

    const [teacherRes, studentRes, salaryRes, securityRes] = await Promise.all([
      supabase.from("teachers").select("id,name").eq("id", teacherId).single(),
      supabase
        .from("student_teachers")
        .select("teacher_fee, students(id,name,join_date,status)")
        .eq("teacher_id", teacherId),
      supabase
        .from("monthly_salary")
        .select("*")
        .eq("teacher_id", teacherId)
        .order("year", { ascending: false })
        .order("month", { ascending: false }),
      supabase
        .from("security_fee")
        .select("*")
        .eq("teacher_id", teacherId)
        .order("year", { ascending: false })
        .order("month", { ascending: false }),
    ]);

    setTeacher(teacherRes.data);
    setStudents(
      (studentRes.data || []).map((s: any) => ({
        id: s.students?.id,
        name: s.students?.name,
        join_date: s.students?.join_date,
        status: s.students?.status,
        teacher_fee: s.teacher_fee,
      }))
    );
    setSalaryRecords(salaryRes.data || []);
    setSecurity(securityRes.data || []);

    setLoading(false);
  };

  useEffect(() => {
    if (teacherId) fetchAll();
  }, [teacherId]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (!teacher) return <div className="p-6 text-red-600">Teacher not found</div>;

  // ---------------- CALCULATIONS ----------------
  const activeStudents = students.filter(
    (s) => s.status?.toLowerCase() === "active"
  );
  

const baseSalary = activeStudents.reduce((t, s) => {
  if (isNewStudent(s.join_date)) {
    return t; // NEW student → salary count nahi hogi
  }
  return t + Number(s.teacher_fee || 0);
}, 0);


  const totalSecurity = security.reduce(
    (t, s) => t + Number(s.amount || 0),
    0
  );

  // ---------------- SAVE SECURITY ----------------
  const saveSecurity = async () => {
    if (!secAmount) return alert("Enter amount");

    await supabase.from("security_fee").insert({
      teacher_id: teacherId,
      month: secMonth,
      year: secYear,
      amount: Number(secAmount),
    });

    setSecAmount("");
    fetchAll();
  };

  const deleteSecurity = async (id: number) => {
    if (!confirm("Delete this security fee?")) return;
    await supabase.from("security_fee").delete().eq("id", id);
    fetchAll();
  };

  // ---------------- DELETE SALARY ----------------
  const deleteSalary = async (id: number) => {
    if (!confirm("Delete salary record?")) return;
    await supabase.from("monthly_salary").delete().eq("id", id);
    fetchAll();
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">

      <h1 className="text-2xl font-bold">
        {teacher.name} — Salary Dashboard
      </h1>

      {/* ACTIONS */}
      <div className="flex gap-3">
        <button
          className="bg-green-600 text-white px-4 py-2 rounded"
          onClick={() => setShowAddSalary(true)}
        >
          Add Salary
        </button>

        <button
          className="bg-blue-600 text-white px-4 py-2 rounded"
          onClick={() => setShowSecurity(true)}
        >
          Add Security Fee
        </button>
      </div>

      {/* ASSIGNED STUDENTS */}
      <div className="bg-white rounded shadow p-4">
        <h2 className="font-semibold mb-2">Assigned Students</h2>
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">Name</th>
              <th className="p-2 border">Join Date</th>
              <th className="p-2 border">Teacher Fee</th>
            </tr>
          </thead>
          <tbody>
            {activeStudents.map((s) => (
              <tr key={s.id}>
                <td className="p-2">{s.name}</td>
                <td className="p-2">
                  {s.join_date
                    ? new Date(s.join_date).toLocaleDateString()
                    : "—"}
                </td>
                <td className="p-2">
  {isNewStudent(s.join_date) ? (
    <span className="text-orange-600 font-semibold">NEW</span>
  ) : (
    <>Rs {s.teacher_fee}</>
  )}
</td>
              </tr>
            ))}
          </tbody>
        </table>

        <p className="mt-3 font-semibold">
          Base Salary (Total Fee): Rs {baseSalary}
        </p>
      </div>

      {/* SALARY RECORDS */}
      <div className="bg-white rounded shadow p-4">
        <h2 className="font-semibold mb-2">Monthly Salary Records</h2>

        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
            <th className="p-2 border text-right">Month</th>
              <th className="p-2 text-right border">Total Salary</th>
              <th className="p-2 border">Action</th>
            </tr>
          </thead>
          <tbody>
            {salaryRecords.map((r) => (
              <tr key={r.id}>
                <td className="p-2 text-right">{r.month}/{r.year}</td>
                <td className="p-2 text-right font-semibold">
                  {r.base_salary +
                    r.bonus -
                    r.advance -
                    (r.deduct_salary || 0)}
                </td>
                <td className="p-2 flex gap-2 justify-center">
                  <button
                    className="bg-blue-600 text-white px-3 py-1 rounded"
                    onClick={() => setViewRecord(r)}
                  >
                    Record
                  </button>
                  <button
                    className="bg-red-600 text-white px-3 py-1 rounded"
                    onClick={() => deleteSalary(r.id)}
                  >
                    ❌
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ADD SALARY MODAL */}
      {showAddSalary && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded w-full max-w-xl">
            <SalaryAddForm
              teacherId={teacherId}
              baseSalary={baseSalary}
              onSaved={() => {
                setShowAddSalary(false);
                fetchAll();
              }}
            />
            <button
              className="w-full mt-3 bg-gray-500 text-white py-2 rounded"
              onClick={() => setShowAddSalary(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* SECURITY MODAL */}
      {showSecurity && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded w-full max-w-lg">
            <h2 className="font-bold mb-3">Security Fee</h2>

            <select
              className="border p-2 w-full mb-2"
              value={secMonth}
              onChange={(e) => setSecMonth(Number(e.target.value))}
            >
              {MONTHS.map((m, i) => (
                <option key={i} value={i + 1}>{m}</option>
              ))}
            </select>

            <input
              type="number"
              className="border p-2 w-full mb-2"
              value={secYear}
              onChange={(e) => setSecYear(Number(e.target.value))}
            />

            <input
              type="number"
              placeholder="Amount"
              className="border p-2 w-full mb-3"
              value={secAmount}
              onChange={(e) => setSecAmount(e.target.value)}
            />

            <div className="bg-gray-100 p-2 rounded mb-2 font-semibold">
              Total Security: Rs {totalSecurity + Number(secAmount || 0)}
            </div>

            <button
              className="bg-green-600 text-white w-full py-2 rounded"
              onClick={saveSecurity}
            >
              Save Security
            </button>

            <ul className="mt-3 max-h-40 overflow-y-auto">
              {security.map((s) => (
                <li
                  key={s.id}
                  className="border p-2 mb-1 flex justify-between"
                >
                  <span>
                    {MONTHS[s.month - 1]} {s.year} — Rs {s.amount}
                  </span>
                  <button
                    className="text-red-600 font-bold"
                    onClick={() => deleteSecurity(s.id)}
                  >
                    ❌
                  </button>
                </li>
              ))}
            </ul>

            <button
              className="w-full mt-3 bg-gray-500 text-white py-2 rounded"
              onClick={() => setShowSecurity(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* VIEW RECORD MODAL */}
      {viewRecord && (
        <TeacherSalarySnapshotModal
          teacherId={teacherId as string}
          month={viewRecord.month}
          year={viewRecord.year}
          onClose={() => setViewRecord(null)}
        />
      )}
    </div>
  );
}
