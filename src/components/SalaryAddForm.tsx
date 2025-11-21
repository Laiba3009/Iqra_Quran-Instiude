"use client";
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";

export default function SalaryAddForm({ teacherId, baseSalary, onSaved }: any) {
  const [month, setMonth] = useState("");
  const [year, setYear] = useState(new Date().getFullYear());
  const [bonus, setBonus] = useState(0);
  const [advance, setAdvance] = useState(0);
  const [remarks, setRemarks] = useState("");
  const [loading, setLoading] = useState(false);

  const total = Number(baseSalary) + Number(bonus) - Number(advance);

  const saveSalary = async () => {
    if (!month || !year) {
      alert("Please select month & year");
      return;
    }

    setLoading(true);

    const { error } = await supabase.from("monthly_salary").insert({
      teacher_id: teacherId,
      month: Number(month),
      year: Number(year),
      base_salary: Number(baseSalary),
      bonus: Number(bonus),
      advance: Number(advance),
      remarks: remarks,
    });

    setLoading(false);

    if (error) {
      console.error(error);
      alert("❌ Error saving salary!");
      return;
    }

    alert("✅ Salary saved!");
    onSaved();
    setBonus(0);
    setAdvance(0);
    setRemarks("");
  };

  return (
    <div className="bg-white shadow rounded p-4 mt-6">
      <h2 className="text-lg font-semibold mb-3">Add Salary Record</h2>

      {/* Base Salary Display */}
      <div className="mb-4">
        <p className="font-medium">
          Base Salary (From Students): <span className="text-green-700">Rs {baseSalary}</span>
        </p>
      </div>

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
      <Button onClick={saveSalary} className="mt-4 bg-green-600" disabled={loading}>
        {loading ? "Saving..." : "Save Salary"}
      </Button>
    </div>
  );
}
