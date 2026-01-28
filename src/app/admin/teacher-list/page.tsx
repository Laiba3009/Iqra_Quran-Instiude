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
  join_date?: string;
  status?: "active" | "disabled"; // 👈 add status
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
        .select("teacher_id, teacher_fee, students(id, name, roll_no, join_date, status)")
        .order("id", { ascending: true });

      if (stErr) throw stErr;

      const normalized: StudentLink[] =
        stLinks?.map((s: any) => ({
          id: s.students?.id,
          name: s.students?.name,
          roll_no: s.students?.roll_no,
          teacher_fee: s.teacher_fee,
          teacher_id: s.teacher_id,
          join_date: s.students?.join_date,
          status: s.students?.status || "active", // default active
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

  const isNewStudent = (joinDate?: string) => {
    if (!joinDate) return false;
    const diffDays = (new Date().getTime() - new Date(joinDate).getTime()) / (1000 * 60 * 60 * 24);
    return diffDays < 30;
  };

  // Only active students
  const getAssignedForTeacher = (teacherId: string) => {
    const assigned = studentLinks.filter(
      (s) => s.teacher_id === teacherId && s.status === "active"
    );
    const totalFee = assigned.reduce((sum, s) => {
      return sum + (isNewStudent(s.join_date) ? 0 : Number(s.teacher_fee || 0));
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
        (s) => s.teacher_id === t.id && s.status === "active" && String(s.roll_no || "").toLowerCase().includes(q)
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
        `Rs ${isNewStudent(s.join_date) ? 0 : s.teacher_fee || 0}`,
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
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <BackButton href="/admin/dashboard" label="Back to Dashboard" />
        <h1 className="text-3xl font-bold text-gray-800">Teacher List</h1>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-3 items-start md:items-center justify-between">
          <div className="flex gap-2 w-full md:w-auto">
            <input
              placeholder="Search teacher name or student roll..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border border-gray-300 bg-white text-gray-900 p-3 rounded-lg w-full md:w-80 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
           
            <select
              value={filterSyllabus}
              onChange={(e) => setFilterSyllabus(e.target.value)}
              className="border border-gray-300 bg-white text-gray-900 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg"
            >
              Clear Filters
            </Button>
            <Button onClick={() => loadAll()} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg">
              Refresh
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-md overflow-x-auto border border-gray-300">
          {loading ? (
            <div className="p-6 text-center text-gray-500">Loading...</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-4 text-gray-800 font-semibold">Name</th>
                  <th className="p-4 text-gray-800 font-semibold">Syllabus</th>
                  <th className="p-4 text-gray-800 font-semibold">Total Teacher Fee</th>
                  <th className="p-4 text-gray-800 font-semibold">Assigned Students</th>
                  <th className="p-4 text-gray-800 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visibleTeachers.map((t) => {
                  const { assigned, totalFee } = getAssignedForTeacher(t.id);
                  return (
                    <tr key={t.id} className="border-t border-gray-200 hover:bg-gray-50 transition-colors">
                      <td className="p-4 font-medium text-gray-800">{t.name}</td>
                      <td className="p-4 text-gray-700">
                        {Array.isArray(t.syllabus) ? t.syllabus.join(", ") : t.syllabus || "—"}
                      </td>
                      <td className="p-4 text-gray-700 font-medium">Rs {totalFee}</td>
                      
                      <td className="p-4">
                        <Button
  size="sm"
  className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md"
  onClick={() => openModalFor(t.id)}
>
  View Assigned Students ({assigned.length})
</Button>

                      </td>
                      <td className="p-4 flex gap-2 flex-wrap">
                       
                        <Button size="sm" className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-md" onClick={() => delTeacher(t.id)}>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="bg-white w-full max-w-2xl rounded-xl shadow-xl overflow-hidden border border-gray-300">
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">
                  Assigned Students — {teachers.find((x) => x.id === modalTeacherId)?.name}
                </h3>
                <p className="text-sm text-gray-600">
                  {getAssignedForTeacher(modalTeacherId).assigned.length} students • Total Fee Rs{" "}
                  {getAssignedForTeacher(modalTeacherId).totalFee}
                </p>
              </div>
              <div className="flex gap-2 items-center">
                <Button onClick={() => downloadAssignedPDF(modalTeacherId)} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg">
                  Download PDF
                </Button>
                <Button onClick={closeModal} className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg">
                  Close
                </Button>
              </div>
            </div>

            <div className="p-4 max-h-[60vh] overflow-auto">
              {getAssignedForTeacher(modalTeacherId).assigned.length > 0 ? (
                <ul className="space-y-3">
                  {getAssignedForTeacher(modalTeacherId).assigned.map((s) => (
                    <li
                      key={s.id}
                      className="p-4 border rounded-lg flex justify-between items-center bg-gray-50 border-gray-200"
                    >
                      <div>
                        <div className="font-medium text-gray-800">
                          {s.name}{" "}
                          {isNewStudent(s.join_date) && (
                            <span className="text-xs text-blue-600">(NEW)</span>
                          )}
                        </div>
                        <div className="text-sm text-gray-600">Roll: {s.roll_no || "—"}</div>
                        <div className="text-xs text-gray-500">
                          Join Date: {s.join_date ? new Date(s.join_date).toLocaleDateString() : "—"}
                        </div>
                      </div>
                      <div className="font-medium text-gray-800">
                        Rs {isNewStudent(s.join_date) ? 0 : s.teacher_fee || 0}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-600">No assigned students.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
        </div>

  );
}
