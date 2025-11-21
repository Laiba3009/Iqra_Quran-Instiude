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

  const loadAll = async () => {
    setLoading(true);
    try {
      const { data: tData } = await supabase
        .from("teachers")
        .select("id, name, roll_no, syllabus, email")
        .order("created_at", { ascending: false });

      const { data: stLinks } = await supabase
        .from("student_teachers")
        .select("teacher_id, teacher_fee, students(id, name, roll_no, join_date)")
        .order("id", { ascending: true });

      const normalized: StudentLink[] = stLinks?.map((s: any) => ({
        id: s.students?.id,
        name: s.students?.name,
        roll_no: s.students?.roll_no,
        teacher_fee: s.teacher_fee,
        teacher_id: s.teacher_id,
        join_date: s.students?.join_date,
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

  const getAssignedForTeacher = (teacherId: string) => {
    const assigned = studentLinks.filter((s) => s.teacher_id === teacherId);
    const today = new Date();

    const totalFee = assigned.reduce((sum, s) => {
      const joinDate = s.join_date ? new Date(s.join_date) : null;
      if (joinDate && joinDate > today) return sum;
      return sum + Number(s.teacher_fee || 0);
    }, 0);

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
      <BackButton href="/admin/dashboard" label="Back to Dashboard" />
      <h1 className="text-3xl font-bold text-green-800">Teacher List</h1>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="w-full table-auto border-collapse mt-4">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">Name</th>
              <th className="p-2 border">Syllabus</th>
              <th className="p-2 border">Total Fee</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {visibleTeachers.map((t) => {
              const { assigned, totalFee } = getAssignedForTeacher(t.id);
              return (
                <tr key={t.id} className="border-b hover:bg-gray-50">
                  <td className="p-2">{t.name}</td>
                  <td className="p-2">{t.syllabus?.join(", ") || "—"}</td>
                  <td className="p-2">Rs {totalFee}</td>
                  <td className="p-2">
                   <Button
  size="sm"
  variant="outline"
  onClick={() => window.location.href = `/admin/teachers/salary/${t.id}`}
>
  View Salary Record
</Button>

                  </td>
                </tr>
              );
            })}

            {visibleTeachers.length === 0 && (
              <tr>
                <td colSpan={4} className="p-4 text-center text-gray-500">
                  No teachers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {/* Modal for Assigned Students */}
      {modalOpen && modalTeacherId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white w-full max-w-2xl rounded-lg shadow-lg overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">
                Assigned Students — {teachers.find((x) => x.id === modalTeacherId)?.name}
              </h3>
              <Button onClick={closeModal} className="bg-gray-200 text-black">
                Close
              </Button>
            </div>

            <div className="p-4 max-h-[60vh] overflow-auto">
              {getAssignedForTeacher(modalTeacherId).assigned.length > 0 ? (
                <ul className="space-y-2">
                  {getAssignedForTeacher(modalTeacherId).assigned.map((s) => {
                    const isFuture = s.join_date && new Date(s.join_date) > new Date();
                    return (
                      <li key={s.id} className="p-3 border rounded-md flex justify-between items-center">
                        <div>
                          <div className="font-medium">
                            {s.name} {isFuture && <span className="text-xs text-blue-600">(New)</span>}
                          </div>
                          <div className="text-sm text-gray-500">Roll: {s.roll_no || "—"}</div>
                          <div className="text-xs text-gray-400">
                            Join Date: {s.join_date ? new Date(s.join_date).toLocaleDateString() : "—"}
                          </div>
                        </div>
                        <div className="font-medium">Rs {isFuture ? 0 : s.teacher_fee || 0}</div>
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
