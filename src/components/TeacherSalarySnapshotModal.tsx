"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface Props {
  teacherId: string;
  month: number;
  year: number;
  onClose: () => void;
}

export default function TeacherSalarySnapshotModal({
  teacherId,
  month,
  year,
  onClose,
}: Props) {
  const [loading, setLoading] = useState(true);
  const [snapshot, setSnapshot] = useState<any>(null);

  // -------- FETCH SNAPSHOT --------
  const loadSnapshot = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("teacher_monthly_snapshot")
      .select("*")
      .eq("teacher_id", teacherId)
      .eq("month", month)
      .eq("year", year)
      .maybeSingle();

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    if (data) {
      // 🔹 Filter only active students from snapshot
      const students =
        (data.students || []).filter((s: any) => s.status === "active") || [];

      setSnapshot({ ...data, students });
    } else {
      setSnapshot(null);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadSnapshot();
  }, []);

  // -------- PDF --------
  const generatePDF = () => {
    if (!snapshot) return;

    const doc = new jsPDF();
    doc.setFontSize(14);
    doc.text(`Salary Record (${month}/${year})`, 10, 10);

    autoTable(doc, {
      startY: 18,
      head: [["Student Name", "Fee"]],
      body: snapshot.students.map((s: any) => [
        s.name,
        s.is_new ? "NEW" : `Rs ${s.fee}`,
      ]),
    });

    const y = (doc as any).lastAutoTable.finalY + 10;

    autoTable(doc, {
      startY: y,
      head: [["Salary Detail", "Amount"]],
      body: [
        ["Base Salary", snapshot.total_student_fee],
        ["Bonus", snapshot.bonus || 0],
        ["Advance", snapshot.advance || 0],
        ["Deduct Salary", snapshot.deduct_salary || 0],
        [
          "Net Salary",
          snapshot.total_student_fee +
            (snapshot.bonus || 0) -
            (snapshot.advance || 0) -
            (snapshot.deduct_salary || 0),
        ],
        ["Remarks", snapshot.remarks || "-"],
      ],
    });

    doc.save(`salary-${month}-${year}.pdf`);
  };

  // -------- UI STATES --------
  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
        <div className="bg-white p-6 rounded">Loading...</div>
      </div>
    );
  }

  if (!snapshot) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
        <div className="bg-white p-6 rounded">
          <p>No snapshot found.</p>
          <button
            onClick={onClose}
            className="mt-4 bg-red-500 text-white px-4 py-2 rounded"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const netSalary =
    snapshot.total_student_fee +
    (snapshot.bonus || 0) -
    (snapshot.advance || 0) -
    (snapshot.deduct_salary || 0);

  // -------- UI --------
  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center">
      <div className="bg-white w-full max-w-xl p-6 rounded space-y-4">
        <h2 className="text-lg font-bold">
          Salary Record — {month}/{year}
        </h2>

        {/* STUDENTS */}
        <div className="border rounded p-3 max-h-40 overflow-y-auto">
          {snapshot.students.map((s: any, i: number) => (
            <div key={i} className="flex justify-between border-b py-1">
              <span>{s.name}</span>
              <span>
                {s.is_new ? (
                  <span className="text-orange-600 font-semibold">NEW</span>
                ) : (
                  <>Rs {s.fee}</>
                )}
              </span>
            </div>
          ))}
        </div>

        <p className="font-semibold">
          Base Salary: Rs {snapshot.total_student_fee}
        </p>
        <p>Bonus: Rs {snapshot.bonus || 0}</p>
        <p>Advance: Rs {snapshot.advance || 0}</p>
        <p>Deduct Salary: Rs {snapshot.deduct_salary || 0}</p>
        <p>Remarks: {snapshot.remarks || "-"}</p>
        <p className="font-bold">Net Salary: Rs {netSalary}</p>

        <div className="flex gap-2">
          <button
            onClick={generatePDF}
            className="bg-purple-600 text-white px-4 py-2 rounded w-full"
          >
            Download PDF
          </button>
          <button
            onClick={onClose}
            className="bg-red-500 text-white px-4 py-2 rounded w-full"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
