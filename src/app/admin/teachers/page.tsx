"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import TeacherForm from "../../../components/TeacherForm";
import Link from "next/link";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function TeacherListPage() {
  const [teachers, setTeachers] = useState<any[]>([]);
  const [viewImg, setViewImg] = useState<string | null>(null);

  const fetchTeachers = async () => {
    const { data } = await supabase.from("teacher_salary_form").select("*");
    setTeachers(data || []);
  };

  const deleteTeacher = async (id: string) => {
    const ok = confirm("Are you sure you want to delete this teacher?");
    if (!ok) return;

    await supabase.from("teacher_salary_form").delete().eq("id", id);
    fetchTeachers();
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  return (
    <div className="p-6 max-w-6xl mx-auto">

      <h1 className="text-3xl font-extrabold mb-6">Teachers Management</h1>

      {/* Teacher Add Form */}
      <TeacherForm onTeacherAdded={fetchTeachers} />

      {/* Table */}
      <div className="bg-white rounded-xl shadow mt-6 overflow-hidden">
        <table className="w-full border-collapse">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="p-3 border">Name</th>
              <th className="p-3 border">Subjects</th>
              <th className="p-3 border">Joining</th>
              <th className="p-3 border">Total Fee</th>
              <th className="p-3 border">Security</th>
              <th className="p-3 border">Agreement</th>
              <th className="p-3 border">Actions</th>
            </tr>
          </thead>

          <tbody>
            {teachers.map((t) => (
              <tr
                key={t.id}
                className="border-b hover:bg-gray-50 transition-all"
              >
                <td className="p-3 border font-medium">{t.name}</td>
                <td className="p-3 border">{t.subjects}</td>
                <td className="p-3 border">{t.joining_date}</td>
                <td className="p-3 border">{t.total_fee}</td>
                <td className="p-3 border">{t.security_fee}</td>

                <td className="p-3 border">
                  {t.agreement_file ? (
                    <button
                      className="text-blue-600 hover:text-blue-800 underline"
                      onClick={() => setViewImg(t.agreement_file)}
                    >
                      View
                    </button>
                  ) : (
                    "-"
                  )}
                </td>

                <td className="p-3 border">
                  <div className="flex gap-4">

                    {/* Salary Page */}
                    <Link
                      href={`/admin/teachers/${t.id}`}
                      className="px-3 py-1 rounded bg-indigo-600 text-white hover:bg-indigo-700 transition"
                    >
                      Salary Record
                    </Link>

                    {/* Edit Button */}
                    <Link
                      href={`/admin/teachers/edit/${t.id}`}
                      className="px-3 py-1 rounded bg-green-600 text-white hover:bg-green-700 transition"
                    >
                      Edit
                    </Link>

                    {/* Delete Button */}
                    <button
                      onClick={() => deleteTeacher(t.id)}
                      className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700 transition"
                    >
                      Delete
                    </button>

                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* IMAGE VIEW MODAL */}
      {viewImg && (
        <div className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="relative">
            <img src={viewImg} className="max-w-3xl rounded-lg shadow-2xl" />
            <button
              onClick={() => setViewImg(null)}
              className="absolute -top-4 -right-4 bg-white text-black rounded-full px-3 py-1 shadow hover:bg-gray-200"
            >
              ✕
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
