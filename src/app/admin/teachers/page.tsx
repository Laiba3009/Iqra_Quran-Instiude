"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import BackButton from "@/components/ui/BackButton";

interface Teacher {
  id: string;
  name: string;
  roll_no?: string;
  syllabus?: string[] | null;
  email?: string | null;
}

interface StudentLink {
  id: string;
  name: string;
  roll_no?: string;
  teacher_fee?: number;
  teacher_id?: string;
  join_date?: string;
  status?: string;
}



export default function TeacherList() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [studentLinks, setStudentLinks] = useState<StudentLink[]>([]);
  const [loading, setLoading] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [modalTeacherId, setModalTeacherId] = useState<string | null>(null);

  useEffect(() => {
    loadAll();
  }, []);

  const [isMounted, setIsMounted] = useState(false);

useEffect(() => {
  setIsMounted(true);
}, []);
  const loadAll = async () => {
    setLoading(true);
    try {
      const { data: tData } = await supabase
        .from("teachers")
        .select("id, name, roll_no, syllabus, email")
        .order("created_at", { ascending: false });

      const { data: stLinks } = await supabase
        .from("student_teachers")
        .select("teacher_id, teacher_fee, students(id, name, roll_no, join_date, status)")
        .order("id", { ascending: true });

      const normalized: StudentLink[] =
        stLinks?.map((s: any) => ({
          id: s.students?.id,
          name: s.students?.name,
          roll_no: s.students?.roll_no,
          teacher_fee: s.teacher_fee,
          teacher_id: s.teacher_id,
          join_date: s.students?.join_date,
          status: s.students?.status,
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

  // ✅ New student check (last 30 days)
  const isNewStudent = (joinDate?: string) => {
    if (!joinDate) return false;
    const diffDays =
      (new Date().getTime() - new Date(joinDate).getTime()) /
      (1000 * 60 * 60 * 24);
    return diffDays < 30;
  };

  const getAssignedForTeacher = (teacherId: string) => {
    const assigned = studentLinks.filter(
      (s) => s.teacher_id === teacherId && s.status === "active"
    );

    const totalFee = assigned.reduce(
      (sum, s) =>
        sum + (isNewStudent(s.join_date) ? 0 : Number(s.teacher_fee || 0)),
      0
    );

    return { assigned, totalFee };
  };

  const visibleTeachers = useMemo(() => teachers, [teachers]);

  const openModalFor = (teacherId: string) => {
    setModalTeacherId(teacherId);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalTeacherId(null);
  };

  return (
    <div className="max-w-7xl mx-auto mt-8 p-6 space-y-6">
      <BackButton href="/admin/dashboard" label="Back" />

      {/* PAGE HEADER */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl p-6 shadow">
        <h1 className="text-3xl font-bold">Teacher Salary Management</h1>
        <p className="text-sm opacity-90 mt-1">
          View assigned students & monthly salary overview
        </p>
      </div>

      {/* TABLE CARD */}
      <div className="bg-white rounded-xl shadow p-4">
        {loading ? (
          <p className="text-center py-10 text-gray-500">Loading...</p>
        ) : (
          <table className="w-full mt-2">
            <thead>
              <tr className="bg-blue-50 text-blue-900">
                <th className="p-3 border">Teacher Name</th>
                <th className="p-3 border">Syllabus</th>
                <th className="p-3 border">Total Student Fee</th>
                <th className="p-3 border">Action</th>
              </tr>
            </thead>
            <tbody>
              {visibleTeachers.map((t) => {
                const { totalFee } = getAssignedForTeacher(t.id);
                return (
                  <tr
                    key={t.id}
                    className="border-b hover:bg-blue-50 transition"
                  >
                    <td className="p-3 font-medium">{t.name}</td>
                    <td className="p-3 text-gray-600">
                      {t.syllabus?.join(", ") || "—"}
                    </td>
                    <td className="p-3 font-semibold text-green-700">
                      Rs {totalFee}
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="bg-purple-600 hover:bg-purple-700 text-white"
                          onClick={() =>
                            (window.location.href = `/admin/teachers/salary/${t.id}`)
                          }
                        >
                          Salary
                        </Button>

                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openModalFor(t.id)}
                        >
                          Students
                        </Button>
                        
                                                
                      </div>
                    </td>
                  </tr>
                );
              })}

              {visibleTeachers.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="p-6 text-center text-gray-500"
                  >
                    No teachers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
{isMounted && modalOpen && modalTeacherId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white w-full max-w-2xl rounded-xl shadow-xl overflow-hidden">
            <div className="bg-blue-600 text-white px-4 py-3 flex justify-between">
              <h3 className="font-semibold">
                Assigned Students —{" "}
                {teachers.find((x) => x.id === modalTeacherId)?.name}
              </h3>
              <button onClick={closeModal}>✕</button>
            </div>

            <div className="p-4 max-h-[60vh] overflow-auto">
              {getAssignedForTeacher(modalTeacherId).assigned.length > 0 ? (
                <ul className="space-y-3">
                  {getAssignedForTeacher(modalTeacherId).assigned.map((s) => (
                    <li
                      key={s.id}
                      className="border rounded-lg p-3 flex justify-between items-center bg-gray-50"
                    >
                      <div>
                        <div className="font-medium">
                          {s.name}{" "}
                          {isNewStudent(s.join_date) && (
                            <span className="text-xs text-blue-600">
                              (NEW)
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500">
                          Roll: {s.roll_no || "—"}
                        </div>
                        <div className="text-xs text-gray-400">
                          Joined:{" "}
                          {s.join_date
                            ? new Date(s.join_date).toLocaleDateString()
                            : "—"}
                        </div>
                      </div>

                      <div className="font-semibold text-green-700">
                        Rs{" "}
                        {isNewStudent(s.join_date)
                          ? 0
                          : s.teacher_fee || 0}
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 text-center py-6">
                  No assigned students.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
