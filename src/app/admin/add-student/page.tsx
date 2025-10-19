"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import BackButton from "@/components/ui/BackButton";

export default function AddStudent() {
  const [form, setForm] = useState({
    id: "",
    name: "",
    roll_no: "",
    contact: "",
    email: "",
    syllabus: [] as string[],
    student_fee: "",
    fee_status: "unpaid",
    teachers: [] as string[], // teacher emails
    teacher_ids: [] as string[], // UUIDs for relationships
    join_date: "",
    class_times: [] as { day: string; time: string }[],
  });

  const [rows, setRows] = useState<any[]>([]);
  const [teacherList, setTeacherList] = useState<{ id: string; name: string; email: string }[]>([]);
  const [editing, setEditing] = useState(false);

  const syllabusList = [
    "Quran",
    "Islamic Studies",
    "Quran Translation & Tafseer",
    "Urdu",
    "English",
  ];

  useEffect(() => {
    loadRows();
    loadTeachers();
  }, []);

  const loadRows = async () => {
    const { data, error } = await supabase
      .from("students")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setRows(data);
  };

  const loadTeachers = async () => {
    const { data, error } = await supabase.from("teachers").select("id, name, email");
    if (!error && data) setTeacherList(data);
  };

  const toggleSyllabus = (name: string) => {
    setForm((prev) => ({
      ...prev,
      syllabus: prev.syllabus.includes(name)
        ? prev.syllabus.filter((c) => c !== name)
        : [...prev.syllabus, name],
    }));
  };

  // ✅ toggle teacher — updates both emails and UUIDs
  const toggleTeacher = (teacher: { id: string; email: string }) => {
    setForm((prev) => {
      const alreadySelected = prev.teacher_ids.includes(teacher.id);
      return {
        ...prev,
        teachers: alreadySelected
          ? prev.teachers.filter((t) => t !== teacher.email)
          : [...prev.teachers, teacher.email],
        teacher_ids: alreadySelected
          ? prev.teacher_ids.filter((t) => t !== teacher.id)
          : [...prev.teacher_ids, teacher.id],
      };
    });
  };

  // ✅ save student
  const save = async () => {
    if (!form.name || !form.roll_no) {
      alert("Please fill all required fields.");
      return;
    }

    const payload = {
      name: form.name,
      roll_no: form.roll_no,
      contact: form.contact || null,
      email: form.email || null,
      syllabus: form.syllabus,
      student_fee: Number(form.student_fee || 0),
      fee_status: form.fee_status,
      teachers: form.teachers,
      teacher_ids: form.teacher_ids,
      join_date: form.join_date || null,
      class_times: form.class_times,
    };

    if (editing) {
      const { error } = await supabase.from("students").update(payload).eq("id", form.id);
      if (error) return alert(error.message);
    } else {
      const { error } = await supabase.from("students").insert([payload]);
      if (error) return alert(error.message);
    }

    setForm({
      id: "",
      name: "",
      roll_no: "",
      contact: "",
      email: "",
      syllabus: [],
      student_fee: "",
      fee_status: "unpaid",
      teachers: [],
      teacher_ids: [],
      join_date: "",
      class_times: [],
    });
    setEditing(false);
    await loadRows();
  };

  const editStudent = (student: any) => {
    setForm({
      id: student.id,
      name: student.name,
      roll_no: student.roll_no,
      contact: student.contact,
      email: student.email,
      syllabus: student.syllabus ?? [],
      student_fee: student.student_fee,
      fee_status: student.fee_status,
      teachers: student.teachers ?? [],
      teacher_ids: student.teacher_ids ?? [],
      join_date: student.join_date ?? "",
      class_times: student.class_times ?? [],
    });
    setEditing(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleFee = async (id: string, status: string) => {
    const newStatus = status === "paid" ? "unpaid" : "paid";
    await supabase.from("students").update({ fee_status: newStatus }).eq("id", id);
    await loadRows();
  };

  const del = async (id: string) => {
    if (!confirm("Are you sure you want to delete this student?")) return;
    await supabase.from("students").delete().eq("id", id);
    await loadRows();
  };

  return (
    <div className="bg-blue-100 min-h-screen py-12 mt-8 px-4 md:px-8 space-y-8">
      <BackButton href="/admin/dashboard" label="Back" />

      {/* Form */}
      <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 space-y-6">
        <h1 className="text-3xl font-bold text-green-800">
          {editing ? "Edit Student" : "Add Student"}
        </h1>

        <div className="grid md:grid-cols-2 gap-4">
          <input
            className="border p-3 rounded-lg"
            placeholder="Full Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            className="border p-3 rounded-lg"
            placeholder="Roll No"
            value={form.roll_no}
            onChange={(e) => setForm({ ...form, roll_no: e.target.value })}
          />
          <input
            className="border p-3 rounded-lg"
            placeholder="Contact"
            value={form.contact}
            onChange={(e) => setForm({ ...form, contact: e.target.value })}
          />
          <input
            className="border p-3 rounded-lg"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            className="border p-3 rounded-lg"
            placeholder="Fee"
            value={form.student_fee}
            onChange={(e) => setForm({ ...form, student_fee: e.target.value })}
          />
        </div>

        {/* Join Date */}
        <div>
          <h2 className="font-semibold mb-2 text-gray-700">Join Date</h2>
          <input
            type="date"
            className="border p-3 rounded-lg w-full"
            value={form.join_date}
            onChange={(e) => setForm({ ...form, join_date: e.target.value })}
          />
        </div>

        {/* Syllabus */}
        <div>
          <h2 className="font-semibold mb-2 text-gray-700">Select Syllabus</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {syllabusList.map((s) => (
              <label
                key={s}
                className={`cursor-pointer border px-3 py-2 rounded-lg ${
                  form.syllabus.includes(s) ? "bg-green-100 border-green-600" : "hover:bg-gray-50"
                }`}
              >
                <input
                  type="checkbox"
                  className="hidden"
                  checked={form.syllabus.includes(s)}
                  onChange={() => toggleSyllabus(s)}
                />
                {s}
              </label>
            ))}
          </div>
        </div>

        {/* Teachers */}
        <div>
          <h2 className="font-semibold mb-2 text-gray-700">Assign Teachers</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {teacherList.map((t) => (
              <label
                key={t.id}
                className={`cursor-pointer border px-3 py-2 rounded-lg ${
                  form.teacher_ids.includes(t.id) ? "bg-green-100 border-green-600" : "hover:bg-gray-50"
                }`}
              >
                <input
                  type="checkbox"
                  className="hidden"
                  checked={form.teacher_ids.includes(t.id)}
                  onChange={() => toggleTeacher(t)}
                />
                {t.name} ({t.email})
              </label>
            ))}
          </div>
        </div>

        <Button
          onClick={save}
          className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white"
        >
          {editing ? "Update Student" : "Save Student"}
        </Button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Students List</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-green-100 text-left">
                <th className="p-3">Name</th>
                <th className="p-3">Roll</th>
                <th className="p-3">Teachers</th>
                <th className="p-3">Fee</th>
                <th className="p-3">Status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t hover:bg-gray-50">
                  <td className="p-3">{r.name}</td>
                  <td className="p-3">{r.roll_no}</td>
                  <td className="p-3">{r.teachers?.join(", ") || "—"}</td>
                  <td className="p-3">Rs {r.student_fee}</td>
                  <td
                    className={`p-3 font-medium ${
                      r.fee_status === "paid" ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {r.fee_status}
                  </td>
                  <td className="p-3 flex gap-2 flex-wrap">
                    <Button size="sm" variant="outline" onClick={() => editStudent(r)}>
                      Edit
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => toggleFee(r.id, r.fee_status)}>
                      Toggle Fee
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => del(r.id)}>
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center text-gray-500 p-4">
                    No students found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
