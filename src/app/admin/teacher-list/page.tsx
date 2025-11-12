"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import BackButton from "@/components/ui/BackButton";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

type Teacher = {
  id: string;
  name: string;
  roll_no?: string;
  syllabus?: string[] | null;
  salary_status?: string | null;
  email?: string | null;
};

type StudentLink = {
  id: string;
  name: string;
  roll_no?: string;
  teacher_fee?: number;
  teacher_id?: string;
  join_date?: string; // 👈 new field
};

export default function TeacherList() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [studentLinks, setStudentLinks] = useState<StudentLink[]>([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [filterSyllabus, setFilterSyllabus] = useState("all");
  const [filterSalary, setFilterSalary] = useState<"all" | "paid" | "unpaid">("all");

  const [modalOpen, setModalOpen] = useState(false);
  const [modalTeacherId, setModalTeacherId] = useState<string | null>(null);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const { data: tData, error: tErr } = await supabase
        .from("teachers")
        .select("id, name, roll_no, syllabus, salary_status, email")
        .order("created_at", { ascending: false });

      if (tErr) throw tErr;

      const { data: stLinks, error: stErr } = await supabase
        .from("student_teachers")
        .select("teacher_id, teacher_fee, students(id, name, roll_no, join_date)")
        .order("id", { ascending: true });

      if (stErr) throw stErr;

      const normalized: StudentLink[] =
        stLinks?.map((s: any) => ({
          id: s.students?.id,
          name: s.students?.name,
          roll_no: s.students?.roll_no,
          teacher_fee: s.teacher_fee,
          teacher_id: s.teacher_id,
          join_date: s.students?.join_date, // ✅
        })) ?? [];

      setTeachers(tData ?? []);
      setStudentLinks(normalized);
    } catch (err: any) {
      console.error("Load error", err);
      alert(err.message || "Error loading data");
    } finally {
      setLoading(false);
    }
  };

  // syllabus options
  const syllabusOptions = useMemo(() => {
    const setS = new Set<string>();
    teachers.forEach((t) => {
      if (Array.isArray(t.syllabus)) t.syllabus.forEach((s) => setS.add(s));
    });
    return ["all", ...Array.from(setS)];
  }, [teachers]);

  // 👇 Fee calculation with join_date check
  const getAssignedForTeacher = (teacherId: string) => {
    const assigned = studentLinks.filter((s) => s.teacher_id === teacherId);
    const today = new Date();

    const totalFee = assigned.reduce((sum, s) => {
      const joinDate = s.join_date ? new Date(s.join_date) : null;
      if (joinDate && joinDate > today) return sum; // future students → fee = 0
      return sum + Number(s.teacher_fee || 0);
    }, 0);

    return { assigned, totalFee };
  };

  const visibleTeachers = useMemo(() => {
    const q = search.trim().toLowerCase();

    return (teachers ?? []).filter((t) => {
      if (filterSyllabus !== "all") {
        const has = Array.isArray(t.syllabus) && t.syllabus.includes(filterSyllabus);
        if (!has) return false;
      }

      if (filterSalary !== "all") {
        if ((t.salary_status ?? "unpaid") !== filterSalary) return false;
      }

      if (!q) return true;

      if ((t.name ?? "").toLowerCase().includes(q)) return true;

      const hasStudentRoll = studentLinks.some(
        (s) => s.teacher_id === t.id && String(s.roll_no || "").toLowerCase().includes(q)
      );
      if (hasStudentRoll) return true;

      return false;
    });
  }, [teachers, studentLinks, search, filterSyllabus, filterSalary]);

  const openModalFor = (teacherId: string) => {
    setModalTeacherId(teacherId);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalTeacherId(null);
  };

  const toggleSalary = async (id: string, status: string | undefined) => {
    const newStatus = status === "paid" ? "unpaid" : "paid";
    await supabase.from("teachers").update({ salary_status: newStatus }).eq("id", id);
    await loadAll();
  };

  const delTeacher = async (id: string) => {
    if (!confirm("Delete teacher and related mappings?")) return;
    await supabase.from("student_teachers").delete().eq("teacher_id", id);
    await supabase.from("teachers").delete().eq("id", id);
    await loadAll();
  };

  const downloadAssignedPDF = (teacherId: string) => {
    const teacher = teachers.find((t) => t.id === teacherId);
    if (!teacher) return alert("Teacher not found");

    const { assigned, totalFee } = getAssignedForTeacher(teacherId);
    const doc = new jsPDF();

    const logoPath = "/images/logo1.jpg";
    const img = new Image();
    img.src = logoPath;

    img.onload = () => {
      doc.addImage(img, "JPEG", 14, 10, 20, 20);
      doc.setFontSize(16);
      doc.setTextColor(0, 51, 102);
      doc.text("Iqra Online Quran Institute", 38, 22);
      doc.setFontSize(14);
      doc.text(`Assigned Students — ${teacher.name}`, 14, 36);
      doc.setFontSize(11);
      doc.text(`Total Students: ${assigned.length}`, 14, 44);
      doc.text(`Total Fee: Rs ${totalFee}`, 14, 50);

      const table = assigned.map((s, i) => [
        i + 1,
        s.name || "—",
        s.roll_no || "—",
        `Rs ${s.teacher_fee || 0}`,
      ]);

      autoTable(doc, {
        head: [["#", "Student Name", "Roll No", "Teacher Fee"]],
        body: table,
        startY: 56,
        styles: { fontSize: 10, cellPadding: 3 },
      });

      doc.save(`AssignedStudents_${teacher.name.replace(/\s+/g, "_")}.pdf`);
    };
  };

  return (
    <div className="max-w-7xl mx-auto mt-8 p-6 space-y-6">
      <BackButton href="/admin/dashboard" label="Back to Dashboard" />
      <h1 className="text-3xl font-bold text-green-800">Teacher List</h1>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3 items-start md:items-center justify-between">
        <div className="flex gap-2 w-full md:w-auto">
          <input
            placeholder="Search teacher name or student roll..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border p-2 rounded w-full md:w-80"
          />
          <select
            value={filterSalary}
            onChange={(e) => setFilterSalary(e.target.value as any)}
            className="border p-2 rounded"
          >
            <option value="all">All Status</option>
            <option value="paid">Paid</option>
            <option value="unpaid">Unpaid</option>
          </select>
          <select
            value={filterSyllabus}
            onChange={(e) => setFilterSyllabus(e.target.value)}
            className="border p-2 rounded"
          >
            {syllabusOptions.map((s) => (
              <option key={s} value={s}>
                {s === "all" ? "All Subjects" : s}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={() => {
              setSearch("");
              setFilterSyllabus("all");
              setFilterSalary("all");
            }}
            className="bg-gray-200 text-black"
          >
            Clear Filters
          </Button>
          <Button onClick={() => loadAll()} className="bg-blue-600">
            Refresh
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded shadow overflow-x-auto">
        {loading ? (
          <div className="p-6">Loading...</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-green-100">
                <th className="p-3">Name</th>
                <th className="p-3">Syllabus</th>
                <th className="p-3">Total Teacher Fee</th>
                <th className="p-3">Status</th>
                <th className="p-3">Assigned Students</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleTeachers.map((t) => {
                const { assigned, totalFee } = getAssignedForTeacher(t.id);
                return (
                  <tr key={t.id} className="border-t hover:bg-gray-50">
                    <td className="p-3 font-medium">{t.name}</td>
                    <td className="p-3">
                      {Array.isArray(t.syllabus) ? t.syllabus.join(", ") : t.syllabus || "—"}
                    </td>
                    <td className="p-3 text-purple-600 font-semibold">Rs {totalFee}</td>
                    <td
                      className={`p-3 ${
                        t.salary_status === "paid" ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {t.salary_status ?? "unpaid"}
                    </td>
                    <td className="p-3">
                      <Button size="sm" variant="outline" onClick={() => openModalFor(t.id)}>
                        View Assigned Students ({assigned.length})
                      </Button>
                    </td>
                    <td className="p-3 flex gap-2 flex-wrap">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleSalary(t.id, t.salary_status)}
                      >
                        {t.salary_status === "paid" ? "Mark Unpaid" : "Mark Paid"}
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => delTeacher(t.id)}>
                        Delete
                      </Button>
                    </td>
                  </tr>
                );
              })}
              {visibleTeachers.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-gray-500">
                    No teachers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {modalOpen && modalTeacherId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white w-full max-w-2xl rounded-lg shadow-lg overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <div>
                <h3 className="text-lg font-semibold">
                  Assigned Students — {teachers.find((x) => x.id === modalTeacherId)?.name}
                </h3>
                <p className="text-sm text-gray-500">
                  {getAssignedForTeacher(modalTeacherId).assigned.length} students • Total Fee Rs{" "}
                  {getAssignedForTeacher(modalTeacherId).totalFee}
                </p>
              </div>
              <div className="flex gap-2 items-center">
                <Button onClick={() => downloadAssignedPDF(modalTeacherId)} className="bg-indigo-600">
                  Download PDF
                </Button>
                <Button onClick={closeModal} className="bg-gray-200 text-black">
                  Close
                </Button>
              </div>
            </div>

            <div className="p-4 max-h-[60vh] overflow-auto">
              {getAssignedForTeacher(modalTeacherId).assigned.length > 0 ? (
                <ul className="space-y-2">
                  {getAssignedForTeacher(modalTeacherId).assigned.map((s) => {
                    const isFuture =
                      s.join_date && new Date(s.join_date) > new Date();
                    return (
                      <li
                        key={s.id}
                        className="p-3 border rounded-md flex justify-between items-center"
                      >
                        <div>
                          <div className="font-medium">
                            {s.name}{" "}
                            {isFuture && (
                              <span className="text-xs text-blue-600">(New)</span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500">
                            Roll: {s.roll_no || "—"}
                          </div>
                          <div className="text-xs text-gray-400">
                            Join Date:{" "}
                            {s.join_date
                              ? new Date(s.join_date).toLocaleDateString()
                              : "—"}
                          </div>
                        </div>
                        <div className="font-medium">
                          Rs{" "}
                          {isFuture ? 0 : s.teacher_fee || 0}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="text-gray-500">No assigned students.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
