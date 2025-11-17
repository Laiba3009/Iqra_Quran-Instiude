"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Props {
  teacherId: string;
  baseSalary: number;
  onSaved: () => void;
}

export default function SalaryAddForm({ teacherId, baseSalary, onSaved }: Props) {
  const [month, setMonth] = useState<number>(1);
  const [year, setYear] = useState<number>(2025);
  const [bonus, setBonus] = useState<number>(0);
  const [advance, setAdvance] = useState<number>(0);
  const [remarks, setRemarks] = useState("");

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await supabase.from("monthly_salary").insert([{
      teacher_id: teacherId,
      month,
      year,
      base_salary: baseSalary,
      bonus,
      advance,
      remarks
    }]);

    if (error) {
      alert("Error saving salary!");
      console.log(error);
      return;
    }

    setBonus(0);
    setAdvance(0);
    setRemarks("");
    onSaved();
  };

  return (
    <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-6 gap-4 p-4 border rounded bg-white shadow">
      <select value={month} onChange={(e) => setMonth(Number(e.target.value))} required className="border p-2 rounded">
        {[...Array(12)].map((_, i) => <option key={i} value={i+1}>{i+1}</option>)}
      </select>
      <input type="number" value={year} onChange={(e) => setYear(Number(e.target.value))} placeholder="Year" className="border p-2 rounded" required />
      <input type="number" value={bonus} onChange={(e) => setBonus(Number(e.target.value))} placeholder="Bonus" className="border p-2 rounded" />
      <input type="number" value={advance} onChange={(e) => setAdvance(Number(e.target.value))} placeholder="Advance" className="border p-2 rounded" />
      <input type="text" value={remarks} onChange={(e) => setRemarks(e.target.value)} placeholder="Remarks" className="border p-2 rounded" />
      <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">Save</button>
    </form>
  );
}
