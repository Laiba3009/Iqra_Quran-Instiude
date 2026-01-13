"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";

export default function SalaryAddForm({ teacherId, baseSalary, onSaved }: any) {
  const [month, setMonth] = useState("");
  const [year, setYear] = useState(new Date().getFullYear());
  const [bonus, setBonus] = useState(0);
  const [advance, setAdvance] = useState(0);
  const [deductSalary, setDeductSalary] = useState("");
  const [remarks, setRemarks] = useState("");
  const [loading, setLoading] = useState(false);

  const total = Number(baseSalary) + Number(bonus) - Number(advance) - Number(deductSalary || 0);

  const saveSalary = async () => {
    if (!month || !year) {
      alert("Please select month & year");
      return;
    }

    setLoading(true);

    try {
      // ---------------- 1️⃣ Save in monthly_salary ----------------
      const { error: salaryError } = await supabase.from("monthly_salary").insert({
        teacher_id: teacherId,
        month: Number(month),
        year: Number(year),
        base_salary: Number(baseSalary),
        bonus: Number(bonus),
        advance: Number(advance),
        deduct_salary: Number(deductSalary || 0),
        remarks,
      });

      if (salaryError) throw salaryError;

      // ---------------- 2️⃣ Save / Upsert in teacher_monthly_snapshot ----------------
      const { data: existingSnapshot } = await supabase
        .from("teacher_monthly_snapshot")
        .select("*")
        .eq("teacher_id", teacherId)
        .eq("month", Number(month))
        .eq("year", Number(year))
        .maybeSingle();

      if (existingSnapshot) {
        // Update snapshot
        await supabase
          .from("teacher_monthly_snapshot")
          .update({
            total_student_fee: Number(baseSalary),
            bonus: Number(bonus),
            advance: Number(advance),
            deduct_salary: Number(deductSalary || 0),
            remarks,
          })
          .eq("id", existingSnapshot.id);
      } else {
        // Create snapshot
        // Fetch assigned students for this teacher
        const { data: studentsData } = await supabase
          .from("student_teachers")
          .select("teacher_fee, students(id, name)")
          .eq("teacher_id", teacherId);

        const activeStudents =
          studentsData?.map((s: any) => ({
            name: s.students.name,
            fee: Number(s.teacher_fee || 0),
          })) || [];

        await supabase.from("teacher_monthly_snapshot").insert({
          teacher_id: teacherId,
          month: Number(month),
          year: Number(year),
          students: activeStudents,
          total_student_fee: Number(baseSalary),
          bonus: Number(bonus),
          advance: Number(advance),
          deduct_salary: Number(deductSalary || 0),
          remarks,
        });
      }

      alert("✅ Salary saved to both tables!");
      onSaved();

      // Reset form
      setMonth("");
      setYear(new Date().getFullYear());
      setBonus(0);
      setAdvance(0);
      setDeductSalary("");
      setRemarks("");
    } catch (err: any) {
      console.error(err);
      alert("❌ Error saving salary: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow rounded p-4 mt-6">
      <h2 className="text-lg font-semibold mb-3">Add Salary Record</h2>

      {/* Month & Year */}
      <div className="flex gap-3 mb-4">
        <select
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="border p-2 rounded w-full"
        >
          <option value="">Select Month</option>
          {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>

        <input
          type="number"
          className="border p-2 rounded w-full"
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          placeholder="Year"
        />
      </div>

      {/* Bonus */}
      <div className="mb-4">
        <label className="block font-medium mb-1">Bonus</label>
        <input
          type="number"
          value={bonus}
          onChange={(e) => setBonus(Number(e.target.value))}
          className="border p-2 rounded w-full"
        />
      </div>

      {/* Advance */}
      <div className="mb-4">
        <label className="block font-medium mb-1">Advance</label>
        <input
          type="number"
          value={advance}
          onChange={(e) => setAdvance(Number(e.target.value))}
          className="border p-2 rounded w-full"
        />
      </div>

      {/* Deduct Salary */}
      <div className="mb-4">
        <label className="block font-medium mb-1">Deduct Salary</label>
        <input
          type="number"
          className="border p-2 rounded w-full"
          placeholder="Deduction amount"
          value={deductSalary}
          onChange={(e) => setDeductSalary(e.target.value)}
        />
      </div>

      {/* Remarks */}
      <div className="mb-4">
        <label className="block font-medium mb-1">Remarks</label>
        <textarea
          rows={2}
          value={remarks}
          onChange={(e) => setRemarks(e.target.value)}
          className="border p-2 rounded w-full"
          placeholder="Optional notes..."
        />
      </div>

      {/* Total Salary */}
      <div className="font-semibold text-lg mt-3">
        Total Salary: <span className="text-blue-700">Rs {total}</span>
      </div>

      {/* Save Button */}
      <Button
        onClick={saveSalary}
        className="mt-4 bg-green-600"
        disabled={loading}
      >
        {loading ? "Saving..." : "Save Salary"}
      </Button>
    </div>
  );
}
