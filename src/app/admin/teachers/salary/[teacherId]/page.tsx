"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import SalaryAddForm from "@/components/SalaryAddForm";
import TeacherSalarySnapshotModal from "@/components/TeacherSalarySnapshotModal";

// 🔵 Months
const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

export default function TeacherSalaryPage() {
  const { teacherId } = useParams();

  const [teacher, setTeacher] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [records, setRecords] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [filterMonth, setFilterMonth] = useState(new Date().getMonth() + 1);
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());

  // Add Salary Modal
  const [showAddSalary, setShowAddSalary] = useState(false);

  // View Record Modal
  const [viewRecord, setViewRecord] = useState<any>(null);

  // ---------------- FETCH TEACHER ----------------
  const fetchTeacher = async () => {
    const { data } = await supabase
      .from("teachers")
      .select("id, name")
      .eq("id", teacherId)
      .maybeSingle();
    setTeacher(data);
  };

  // ---------------- FETCH STUDENTS ----------------
  const fetchStudents = async () => {
    const { data } = await supabase
      .from("student_teachers")
      .select("teacher_fee, students(id, name, join_date, status)")
      .eq("teacher_id", teacherId);

    const formatted = (data || []).map((s: any) => ({
      id: s.students?.id,
      name: s.students?.name,
      join_date: s.students?.join_date,
      status: s.students?.status,
      teacher_fee: s.teacher_fee,
    }));

    setStudents(formatted);
  };

  // ---------------- FETCH SALARY RECORDS ----------------
  const fetchRecords = async () => {
    const { data } = await supabase
      .from("monthly_salary")
      .select("*")
      .eq("teacher_id", teacherId)
      .order("year", { ascending: false })
      .order("month", { ascending: false });

    setRecords(data || []);
  };

  // ---------------- DELETE SALARY ----------------
  const deleteSalaryRecord = async (id: number) => {
    if (!confirm("Are you sure you want to delete this salary record?")) return;

    const { error } = await supabase
      .from("monthly_salary")
      .delete()
      .eq("id", id);

    if (error) {
      alert("Error deleting salary record!");
      return;
    }

    alert("Deleted successfully!");
    fetchRecords();
  };

  useEffect(() => {
    if (!teacherId) return;
    setLoading(true);
    Promise.all([fetchTeacher(), fetchStudents(), fetchRecords()]).finally(() =>
      setLoading(false)
    );
  }, [teacherId]);

  if (loading) return <div className="p-6">Loading...</div>;
  if (!teacher) return <div className="p-6 text-red-600">Teacher not found</div>;

  // Active students for base salary
  const monthlyStudents = students.filter(s => s.status?.toLowerCase() === "active");
  const baseSalary = monthlyStudents.reduce((t, s) => t + Number(s.teacher_fee || 0), 0);

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">{teacher.name} — Salary Dashboard</h1>

      {/* ---------------- Add Salary Button ---------------- */}
      <button
        className="bg-green-600 text-white px-4 py-2 rounded"
        onClick={() => setShowAddSalary(true)}
      >
        Add Salary
      </button>

      {/* ---------------- Add Salary Modal ---------------- */}
      {showAddSalary && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white w-full max-w-xl p-6 rounded">
            <SalaryAddForm
              teacherId={teacherId}
              baseSalary={baseSalary}
              onSaved={() => {
                setShowAddSalary(false);
                fetchRecords();
              }}
            />
            <button
              className="w-full mt-3 bg-red-500 text-white py-2 rounded"
              onClick={() => setShowAddSalary(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* ---------------- FILTERS ---------------- */}
      <div className="flex gap-3 mt-4">
        <select
          className="border p-2"
          value={filterMonth}
          onChange={(e) => setFilterMonth(Number(e.target.value))}
        >
          {MONTHS.map((m, i) => (
            <option key={i} value={i + 1}>{m}</option>
          ))}
        </select>
        <input
          type="number"
          className="border p-2 w-32"
          value={filterYear}
          onChange={(e) => setFilterYear(Number(e.target.value))}
        />
      </div>

      {/* ---------------- STUDENTS TABLE ---------------- */}
      <div className="bg-white rounded shadow p-4">
        <h2 className="font-semibold mb-3 text-lg">Assigned Students</h2>
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">Name</th>
              <th className="p-2 border">Join Date</th>
              <th className="p-2 border">Teacher Fee</th>
            </tr>
          </thead>
          <tbody>
            {monthlyStudents.map((s) => (
              <tr key={s.id}>
                <td className="p-2">{s.name}</td>
                <td className="p-2">{s.join_date ? new Date(s.join_date).toLocaleDateString() : "—"}</td>
                <td className="p-2">Rs {s.teacher_fee}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ---------------- SALARY RECORDS ---------------- */}
      <div className="bg-white rounded shadow p-4">
        <h2 className="font-semibold mb-3 text-lg">Monthly Salary Records</h2>
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">Month/Year</th>
              <th className="p-2 border">Base</th>
              <th className="p-2 border">Bonus</th>
              <th className="p-2 border">Advance</th>
              <th className="p-2 border">Deduct</th>
              <th className="p-2 border">Remarks</th>
              <th className="p-2 border">Total</th>
              <th className="p-2 border">Action</th>
            </tr>
          </thead>
          <tbody>
            {records.map((r) => {
              const total = r.base_salary + r.bonus - r.advance - (r.deduct_salary || 0);
              return (
                <tr key={r.id}>
                  <td className="p-2">{r.month}/{r.year}</td>
                  <td className="p-2">{r.base_salary}</td>
                  <td className="p-2 text-green-600">{r.bonus}</td>
                  <td className="p-2 text-red-600">{r.advance}</td>
                  <td className="p-2 text-red-500">{r.deduct_salary || 0}</td>
                  <td className="p-2">{r.remarks || "—"}</td>
                  <td className="p-2 font-semibold">{total}</td>
                  <td className="p-2 flex gap-1">
                    <button
                      className="text-blue-700 hover:underline"
                      onClick={() => setViewRecord(r)}
                    >
                      View Record
                    </button>
                    <button
                      className="text-red-600 hover:underline"
                      onClick={() => deleteSalaryRecord(r.id)}
                    >
                      ❌
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ---------------- VIEW RECORD MODAL ---------------- */}
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
