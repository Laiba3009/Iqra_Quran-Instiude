"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import TeacherSalarySnapshotModal from "./TeacherSalarySnapshotModal";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

export default function TeacherSalarySnapshotList({
  teacherId,
}: {
  teacherId: string;
}) {
  const [records, setRecords] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Fetch all saved salary snapshots
  const fetchSnapshots = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("teacher_monthly_snapshot")
      .select("*")
      .eq("teacher_id", teacherId)
      .order("year", { ascending: false })
      .order("month", { ascending: false });

    if (error) console.error(error);
    else setRecords(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchSnapshots();
  }, [teacherId]);

  // Delete a snapshot
  const deleteSnapshot = async (id: string) => {
    if (!confirm("Delete this salary record?")) return;

    const { error } = await supabase
      .from("teacher_monthly_snapshot")
      .delete()
      .eq("id", id);

    if (error) {
      alert("Error deleting record!");
      console.error(error);
      return;
    }

    alert("Deleted successfully!");
    fetchSnapshots();
  };

  if (loading) return <p className="p-4">Loading salary records...</p>;

  return (
    <div className="bg-white rounded shadow p-4">
      <h2 className="text-lg font-semibold mb-3">
        Saved Salary Records
      </h2>

      <table className="w-full">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 border">Month/Year</th>
            <th className="p-2 border">Base Salary</th>
            <th className="p-2 border">Net Salary</th>
            <th className="p-2 border">Action</th>
          </tr>
        </thead>

        <tbody>
          {records.map((r) => {
            const net =
              Number(r.total_student_fee || 0) +
              Number(r.bonus || 0) -
              Number(r.advance || 0) -
              Number(r.deduct_salary || 0);

            return (
              <tr key={r.id} className="border-b">
                <td className="p-2">
                  {MONTHS[r.month - 1]} / {r.year}
                </td>

                <td className="p-2">Rs {r.total_student_fee}</td>

                <td className="p-2 font-semibold">Rs {net}</td>

                <td className="p-2 flex gap-2">
                  {/* VIEW BUTTON */}
                  <button
                    className="bg-blue-600 text-white px-3 py-1 rounded text-sm"
                    onClick={() => setSelected(r)}
                  >
                    View
                  </button>

                  {/* DELETE BUTTON */}
                  <button
                    className="bg-red-500 text-white px-3 py-1 rounded text-sm"
                    onClick={() => deleteSnapshot(r.id)}
                  >
                    ❌
                  </button>
                </td>
              </tr>
            );
          })}

          {records.length === 0 && (
            <tr>
              <td
                colSpan={4}
                className="text-center p-4 text-gray-500"
              >
                No salary records found
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* VIEW MODAL */}
      {selected && (
        <TeacherSalarySnapshotModal
          teacherId={teacherId}
          month={selected.month}
          year={selected.year}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  );
}
