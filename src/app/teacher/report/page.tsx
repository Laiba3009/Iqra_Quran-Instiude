"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

interface Report {
  id: string;
  student_id: string;
  report_text?: string;
  complaint_text?: string;
  created_at: string;
  type: "weekly" | "monthly" | "note";
}

interface Student {
  id: string;
  name: string;
  reports: Report[];
  expanded: boolean;
}

export default function TeacherReportsPage() {
  const [teacherId, setTeacherId] = useState<string | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [editingReport, setEditingReport] = useState<Report | null>(null);
  const [editText, setEditText] = useState("");

  useEffect(() => {
    const id = localStorage.getItem("teacher_id");
    if (id) setTeacherId(id);
  }, []);

  useEffect(() => {
    if (teacherId) loadReports();
  }, [teacherId]);

  const loadReports = async () => {
    if (!teacherId) return;

    // Load all reports
    const { data: weekly } = await supabase
      .from("student_progress")
      .select("*")
      .eq("teacher_id", teacherId);

    const { data: monthly } = await supabase
      .from("student_monthly_reports")
      .select("*")
      .eq("teacher_id", teacherId);

    const { data: notes } = await supabase
      .from("student_complaints")
      .select("*")
      .eq("teacher_id", teacherId);

    const allReports: Report[] = [
      ...(weekly || []).map((r) => ({ ...r, type: "weekly" })),
      ...(monthly || []).map((r) => ({ ...r, type: "monthly" })),
      ...(notes || []).map((r) => ({ ...r, type: "note" })),
    ];

    const studentIds = Array.from(new Set(allReports.map((r) => r.student_id)));

    const studentsData: Student[] = [];
    for (let sid of studentIds) {
      const { data } = await supabase
        .from("students")
        .select("name")
        .eq("id", sid)
        .single();
      const studentReports = allReports.filter((r) => r.student_id === sid);
      studentsData.push({
        id: sid,
        name: data?.name || "Unknown",
        reports: studentReports,
        expanded: false,
      });
    }

    setStudents(studentsData);
  };

  const toggleExpand = (id: string) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === id ? { ...s, expanded: !s.expanded } : s))
    );
  };

  const deleteReport = async (report: Report) => {
    const table =
      report.type === "weekly"
        ? "student_progress"
        : report.type === "monthly"
        ? "student_monthly_reports"
        : "student_complaints";

    if (!confirm("Are you sure you want to delete this report?")) return;

    const { error } = await supabase.from(table).delete().eq("id", report.id);
    if (error) {
      console.error("Delete failed:", error.message);
      alert("Delete failed: " + error.message);
    } else {
      loadReports();
    }
  };

  const openEditModal = (report: Report) => {
    setEditingReport(report);
    setEditText(report.report_text || report.complaint_text || "");
  };

  const saveEdit = async () => {
    if (!editingReport) return;

    const table =
      editingReport.type === "weekly"
        ? "student_progress"
        : editingReport.type === "monthly"
        ? "student_monthly_reports"
        : "student_complaints";

    const { error } = await supabase
      .from(table)
      .update(
        editingReport.type === "note"
          ? { complaint_text: editText }
          : { report_text: editText }
      )
      .eq("id", editingReport.id);

    if (error) {
      console.error("Update failed:", error.message);
      alert("Update failed: " + error.message);
      return;
    }

    setEditingReport(null);
    setEditText("");
    loadReports();
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Teacher Reports & Notes</h1>

      {students.length === 0 ? (
        <p>No reports found.</p>
      ) : (
        students.map((student) => (
          <div key={student.id} className="bg-white rounded-lg shadow mb-4 w-full">
            {/* Student Header */}
            <div
              className="cursor-pointer p-4 flex justify-between items-center bg-blue-50 hover:bg-blue-100 rounded-t-lg"
              onClick={() => toggleExpand(student.id)}
            >
              <p className="font-bold text-lg text-gray-700">{student.name}</p>
              <span className="text-gray-500">{student.expanded ? "▲" : "▼"}</span>
            </div>

            {/* Reports */}
            {student.expanded && (
              <div className="p-4 space-y-3">
                {student.reports.map((r) => (
                  <div
                    key={r.id}
                    className="border p-3 rounded bg-gray-50 flex flex-col md:flex-row justify-between items-start gap-3"
                  >
                    <div className="flex-1 max-w-full">
                      <p className="font-semibold capitalize text-gray-700">{r.type}</p>
                      <p className="text-gray-500 text-sm">
                        {new Date(r.created_at).toLocaleString()}
                      </p>
                      <div className="mt-2 max-h-48 overflow-y-auto p-2 bg-white border rounded whitespace-pre-wrap break-words">
                        {r.report_text || r.complaint_text}
                      </div>
                    </div>

                    <div className="flex gap-2 mt-2 md:mt-0">
                      <button
                        className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
                        onClick={() => openEditModal(r)}
                      >
                        Edit
                      </button>
                      <button
                        className="bg-red-600 text-white px-4 py-1 rounded hover:bg-red-700"
                        onClick={() => deleteReport(r)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))
      )}

      {/* Edit Modal */}
      {editingReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6">
            <h2 className="text-xl font-bold mb-4">Edit {editingReport.type} Report</h2>
            <textarea
              className="w-full border rounded p-4 h-56 resize-none whitespace-pre-wrap break-words"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
            />
            <div className="mt-4 flex justify-end gap-3">
              <button
                className="px-5 py-2 rounded bg-gray-300 hover:bg-gray-400"
                onClick={() => setEditingReport(null)}
              >
                Cancel
              </button>
              <button
                className="px-5 py-2 rounded bg-green-600 text-white hover:bg-green-700"
                onClick={saveEdit}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
