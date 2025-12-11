'use client';

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Dialog, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import PDFGenerator from "@/components/PDFGenerator";
import { Trash2 } from "lucide-react";

interface Student {
  id: string;
  name: string;
  roll_no?: string;
  syllabus?: string[];
  class_time?: string | null;
  teacher_name: string;
}

interface Report {
  id: string;
  report_text: string;
  created_at: string;
  teacher_name: string;
}

interface Complaint {
  id: string;
  complaint_text: string;
  created_at: string;
  teacher_name: string;
}

interface EditableReport extends Report {
  type: "report";
}

interface EditableComplaint extends Complaint {
  type: "note";
}

export default function AdminProgressPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [search, setSearch] = useState("");
  const [selectedMonth, setSelectedMonth] = useState<string>("");

  const [editingItem, setEditingItem] = useState<EditableReport | EditableComplaint | null>(null);
  const [editText, setEditText] = useState("");

  useEffect(() => { loadStudents(); }, []);
  useEffect(() => {
    if (!search.trim()) return setFilteredStudents(students);
    const lowerSearch = search.toLowerCase();
    setFilteredStudents(
      students.filter(
        s => s.name.toLowerCase().includes(lowerSearch) || s.roll_no?.toLowerCase().includes(lowerSearch)
      )
    );
  }, [search, students]);

  const loadStudents = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("student_teachers")
      .select(`students(id, name, roll_no, syllabus, class_time), teachers(name)`);
    if (error) console.error(error);
    const parsed: Student[] = data?.map((d: any) => ({
      id: d.students.id,
      name: d.students.name,
      roll_no: d.students.roll_no,
      syllabus: d.students.syllabus,
      class_time: d.students.class_time,
      teacher_name: d.teachers.name,
    })) ?? [];
    setStudents(parsed);
    setFilteredStudents(parsed);
    setLoading(false);
  };

  const loadReports = async (studentId: string) => {
    const { data, error } = await supabase
      .from("student_progress")
      .select(`id, report_text, created_at, teachers:teacher_id(name)`)
      .eq("student_id", studentId)
      .order("created_at", { ascending: true });
    if (error) console.error(error);
    setReports(data?.map((r: any) => ({
      id: r.id,
      report_text: r.report_text,
      created_at: r.created_at,
      teacher_name: r.teachers?.name || "—",
    })) ?? []);
  };

  const loadComplaints = async (studentId: string) => {
    const { data, error } = await supabase
      .from("student_complaints")
      .select(`id, complaint_text, created_at, teachers:teacher_id(name)`)
      .eq("student_id", studentId)
      .order("created_at", { ascending: true });
    if (error) console.error(error);
    setComplaints(data?.map((r: any) => ({
      id: r.id,
      complaint_text: r.complaint_text,
      created_at: r.created_at,
      teacher_name: r.teachers?.name || "—",
    })) ?? []);
  };

  const handleOpenModal = async (student: Student) => {
    setSelectedStudent(student);
    setSelectedMonth("");
    await Promise.all([loadReports(student.id), loadComplaints(student.id)]);
    setOpenModal(true);
  };

  const filteredReports = selectedMonth
    ? reports.filter(r => new Date(r.created_at).toLocaleString("default", { month: "long" }) === selectedMonth)
    : reports;

  const filteredComplaints = selectedMonth
    ? complaints.filter(c => new Date(c.created_at).toLocaleString("default", { month: "long" }) === selectedMonth)
    : complaints;

  const months = Array.from(new Set([
    ...reports.map(r => new Date(r.created_at).toLocaleString("default", { month: "long" })),
    ...complaints.map(c => new Date(c.created_at).toLocaleString("default", { month: "long" }))
  ]));

  return (
    <div className="max-w-6xl mx-auto mt-12 p-6 bg-white rounded-xl shadow">
      <h1 className="text-3xl font-bold text-green-800 mb-6 text-center">🧑‍🎓 All Students Overview</h1>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by student name or roll no..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-lg"
        />
      </div>

      {loading ? <p className="text-center text-gray-500">Loading students...</p> : (
        filteredStudents.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full border border-gray-200 rounded-lg text-left">
              <thead className="bg-green-100 text-green-800">
                <tr>
                  <th className="p-3 border-b">Student Name</th>
                  <th className="p-3 border-b">Roll No</th>
                  <th className="p-3 border-b">Teacher</th>
                  <th className="p-3 border-b">Syllabus</th>
                  <th className="p-3 border-b">Class Time</th>
                  <th className="p-3 border-b text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50 transition">
                    <td className="p-3">{s.name}</td>
                    <td className="p-3">{s.roll_no}</td>
                    <td className="p-3">{s.teacher_name}</td>
                    <td className="p-3 text-sm text-gray-600">{s.syllabus?.length ? s.syllabus.join(", ") : "—"}</td>
                    <td className="p-3 text-sm text-gray-600">{s.class_time || "—"}</td>
                    <td className="p-3 flex justify-center gap-2">
                      <Button
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        onClick={() => handleOpenModal(s)}
                      >
                        Weekly Report + Note
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <p className="text-center text-gray-500">No students found.</p>
      )}

      {/* Modal */}
      <Dialog open={openModal} onOpenChange={setOpenModal}>
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-5xl h-[90vh] relative p-6 flex flex-col">

            {/* CLOSE BUTTON */}
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl font-bold"
              onClick={() => setOpenModal(false)}
            >
              &times;
            </button>

            <DialogHeader>
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center w-full gap-2">
                <DialogTitle className="text-xl font-bold text-center sm:text-left w-full">
                  📘 Progress Report & Notice — {selectedStudent?.name}
                </DialogTitle>

                {selectedStudent && (filteredReports.length > 0 || filteredComplaints.length > 0) && (
                  <PDFGenerator
                    student={selectedStudent}
                    reports={filteredReports}
                    complaints={filteredComplaints}
                    month={selectedMonth}
                    logoUrl="/images/logo1.jpg"
                  />
                )}
              </div>
            </DialogHeader>

            {/* MONTH FILTER */}
            <div className="mb-3 flex justify-center">
              <select
                className="border p-2 rounded w-48"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
              >
                <option value="">All Months</option>
                {months.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>

            {/* REPORTS & NOTES */}
            <div className="flex flex-col md:flex-row gap-6 justify-center overflow-y-auto flex-1">

              {/* WEEKLY REPORTS */}
              <div className="flex flex-col gap-4 w-full md:w-1/2">
                <h2 className="font-bold text-xl text-center">📅 Weekly Reports</h2>
                {filteredReports.length > 0 ? filteredReports.map((r, idx) => (
                  <div key={r.id} className="p-4 rounded-xl border shadow-md break-words" style={{ backgroundColor: ["#E3F2FD", "#FFF3CD", "#E8F5E9", "#F3E5F5"][idx % 4] }}>
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-semibold">{new Date(r.created_at).toLocaleDateString()}</p>
                        <p className="text-sm font-medium">{r.teacher_name}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="destructive" className="h-9 w-9 flex items-center justify-center shrink-0" onClick={async () => {
                          const { error } = await supabase.from("student_progress").delete().eq("id", r.id);
                          if (!error) setReports(prev => prev.filter(rep => rep.id !== r.id));
                        }}>
                          <Trash2 size={18} />
                        </Button>
                        <Button size="sm" className="h-9 px-3 bg-blue-600 text-white hover:bg-blue-700" onClick={() => {
                          setEditingItem({ ...r, type: "report" });
                          setEditText(r.report_text);
                        }}>Edit</Button>
                      </div>
                    </div>
                    <p className="mt-1 text-[15px] leading-relaxed whitespace-pre-wrap">{r.report_text}</p>
                  </div>
                )) : <p className="text-gray-500 text-center">No reports available.</p>}
              </div>

              {/* NOTES */}
              <div className="flex flex-col gap-4 w-full md:w-1/2">
                <h2 className="font-bold text-xl text-center">📝 Notice</h2>
                {filteredComplaints.length > 0 ? filteredComplaints.map((c) => (
                  <div key={c.id} className="p-4 rounded-xl border shadow-md break-words" style={{ backgroundColor: "#FDE7E7" }}>
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="font-semibold">{new Date(c.created_at).toLocaleDateString()}</p>
                        <p className="text-sm font-medium">{c.teacher_name}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="destructive" className="h-9 w-9 flex items-center justify-center shrink-0" onClick={async () => {
                          const { error } = await supabase.from("student_complaints").delete().eq("id", c.id);
                          if (!error) setComplaints(prev => prev.filter(comp => comp.id !== c.id));
                        }}>
                          <Trash2 size={18} />
                        </Button>
                        <Button size="sm" className="h-9 px-3 bg-blue-600 text-white hover:bg-blue-700" onClick={() => {
                          setEditingItem({ ...c, type: "note" });
                          setEditText(c.complaint_text);
                        }}>Edit</Button>
                      </div>
                    </div>
                    <p className="mt-1 text-[15px] leading-relaxed whitespace-pre-wrap">{c.complaint_text}</p>
                  </div>
                )) : <p className="text-gray-500 text-center">No notes available.</p>}
              </div>

            </div>
          </div>
        </div>
      </Dialog>

      {/* EDIT MODAL */}
      {editingItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-2xl p-6">
            <h2 className="text-xl font-bold mb-4">Edit {editingItem.type === "note" ? "Notice" : "Report"}</h2>
            <textarea
              className="w-full border rounded p-4 h-56 resize-y whitespace-pre-wrap break-words"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
            />
            <div className="mt-4 flex justify-end gap-3">
              <button className="px-5 py-2 rounded bg-gray-300 hover:bg-gray-400" onClick={() => setEditingItem(null)}>Cancel</button>
              <button className="px-5 py-2 rounded bg-green-600 text-white hover:bg-green-700" onClick={async () => {
                if (!editingItem) return;
                const table = editingItem.type === "note" ? "student_complaints" : "student_progress";
                const field = editingItem.type === "note" ? "complaint_text" : "report_text";
                const { error } = await supabase.from(table).update({ [field]: editText }).eq("id", editingItem.id);
                if (error) {
                  alert("Update failed: " + error.message);
                  return;
                }
                // update local state
                if (editingItem.type === "note") {
                  setComplaints(prev => prev.map(c => c.id === editingItem.id ? { ...c, complaint_text: editText } : c));
                } else {
                  setReports(prev => prev.map(r => r.id === editingItem.id ? { ...r, report_text: editText } : r));
                }
                setEditingItem(null);
              }}>Save</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
