"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import SalaryAddForm from "../../../../components/SalaryAddForm";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Teacher {
  id: string;
  name: string;
  joining_date?: string;
  total_fee?: number;
  security_fee?: number;
}

interface Monthly {
  id: number;
  month: number;
  year: number;
  base_salary: number;
  bonus: number;
  advance: number;
  remarks?: string;
}

export default function TeacherSalaryPage() {
  const params = useParams();
  const teacherId = (params as any).teacherId as string;

  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [records, setRecords] = useState<Monthly[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTeacher = async () => {
    const { data, error } = await supabase.from("teacher_salary_form").select("*").eq("id", teacherId).single();
    if (!error) setTeacher(data);
  };

  const fetchRecords = async () => {
    const { data, error } = await supabase
      .from("monthly_salary")
      .select("*")
      .eq("teacher_id", teacherId)
      .order("year", { ascending: false })
      .order("month", { ascending: false });
    if (!error) setRecords(data || []);
  };

  useEffect(() => {
    if (!teacherId) return;
    setLoading(true);
    fetchTeacher();
    fetchRecords();
    setLoading(false);
  }, [teacherId]);

  if (!teacher) return <div className="p-6">Loading teacher...</div>;

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Salary Records — {teacher.name}</h1>

      <SalaryAddForm teacherId={teacherId} baseSalary={teacher.total_fee ?? 0} onSaved={fetchRecords} />

      <div className="bg-white rounded shadow overflow-x-auto mt-4">
        <table className="w-full table-auto">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 border">Month/Year</th>
              <th className="p-2 border">Base</th>
              <th className="p-2 border">Bonus</th>
              <th className="p-2 border">Advance</th>
              <th className="p-2 border">Total salary</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="p-4">Loading...</td></tr>
            ) : records.length === 0 ? (
              <tr><td colSpan={5} className="p-4">No records</td></tr>
            ) : (
              records.map(r => (
                <tr key={r.id} className="border-b hover:bg-gray-50">
                  <td className="p-2 border">{r.month}/{r.year}</td>
                  <td className="p-2 border">{r.base_salary}</td>
                  <td className="p-2 border text-green-600">{r.bonus}</td>
                  <td className="p-2 border text-red-600">{r.advance}</td>
                  <td className="p-2 border font-semibold">{r.base_salary + r.bonus - r.advance}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
