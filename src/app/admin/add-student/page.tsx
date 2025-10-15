"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import BackButton from "@/components/ui/BackButton";

export default function AddStudent() {
  const [form, setForm] = useState({
    name: "",
    roll_no: "",
    contact: "",
    email: "",
    syllabus: [] as string[], // ✅ static syllabus list instead of courses
    student_fee: "",
    fee_status: "unpaid",
    teachers: [] as string[],
  });

  const [rows, setRows] = useState<any[]>([]);
  const [teacherList, setTeacherList] = useState<
    { id: string; name: string; email: string }[]
  >([]);

  // ✅ Static syllabus list (manual)
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

  // ✅ Fetch existing students
  const loadRows = async () => {
    const { data, error } = await supabase
      .from("students")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error && data) setRows(data);
  };

  // ✅ Fetch teachers list
  const loadTeachers = async () => {
    const { data, error } = await supabase
      .from("teachers")
      .select("id, name, email");
    if (!error && data) setTeacherList(data);
  };

  // ✅ Toggle syllabus
  const toggleSyllabus = (name: string) => {
    setForm((prev) => ({
      ...prev,
      syllabus: prev.syllabus.includes(name)
        ? prev.syllabus.filter((c) => c !== name)
        : [...prev.syllabus, name],
    }));
  };

  // ✅ Toggle teacher
  const toggleTeacher = (email: string) => {
    setForm((prev) => ({
      ...prev,
      teachers: prev.teachers.includes(email)
        ? prev.teachers.filter((t) => t !== email)
        : [...prev.teachers, email],
    }));
  };

  // ✅ Save new student
  const save = async () => {
    if (!form.name || form.syllabus.length === 0) {
      alert("Please fill all fields and select at least one syllabus.");
      return;
    }

    const payload = {
      ...form,
      student_fee: Number(form.student_fee || 0),
    };

    const { error } = await supabase.from("students").insert([payload]);
    if (error) {
      alert(error.message);
      return;
    }

    // ✅ Reset form
    setForm({
      name: "",
      roll_no: "",
      contact: "",
      email: "",
      syllabus: [],
      student_fee: "",
      fee_status: "unpaid",
      teachers: [],
    });
    await loadRows();
  };

  const toggleFee = async (id: string, status: string) => {
    const newStatus = status === "paid" ? "unpaid" : "paid";
    await supabase.from("students").update({ fee_status: newStatus }).eq("id", id);
    await loadRows();
  };

  const del = async (id: string) => {
    await supabase.from("students").delete().eq("id", id);
    await loadRows();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-12 space-y-8">
      {/* 🔙 Back Button */}
      <div className="mt-7">
        <BackButton href="/admin/dashboard" label="Back to Dashboard" />
      </div>

      {/* 🧾 Add Student Form */}
      <div className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
        <h1 className="text-3xl font-bold text-green-800">Add Student</h1>

        <div className="grid md:grid-cols-2 gap-4">
          <input
            className="border p-3 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
            placeholder="Full Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            className="border p-3 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
            placeholder="Roll No"
            value={form.roll_no}
            onChange={(e) => setForm({ ...form, roll_no: e.target.value })}
          />
          <input
            className="border p-3 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
            placeholder="Contact"
            value={form.contact}
            onChange={(e) => setForm({ ...form, contact: e.target.value })}
          />
          <input
            className="border p-3 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            className="border p-3 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
            placeholder="Fee"
            value={form.student_fee}
            onChange={(e) => setForm({ ...form, student_fee: e.target.value })}
          />
        </div>

        {/* 📚 Syllabus Selection (static) */}
        <div>
          <h2 className="font-semibold mb-2">Select Syllabus</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {syllabusList.map((s) => (
              <label
                key={s}
                className={`cursor-pointer border px-3 py-2 rounded-lg text-sm transition ${
                  form.syllabus.includes(s)
                    ? "bg-green-100 border-green-600"
                    : "hover:bg-gray-50"
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

        {/* 👩‍🏫 Teacher Selection */}
        <div>
          <h2 className="font-semibold mb-2">Select Teachers</h2>
          {teacherList.length === 0 ? (
            <p className="text-gray-500">No teachers found.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
              {teacherList.map((t) => (
                <label
                  key={t.id}
                  className={`cursor-pointer border px-3 py-2 rounded-lg text-sm transition ${
                    form.teachers.includes(t.email)
                      ? "bg-green-100 border-green-600"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="checkbox"
                    className="hidden"
                    checked={form.teachers.includes(t.email)}
                    onChange={() => toggleTeacher(t.email)}
                  />
                  {t.name} ({t.email})
                </label>
              ))}
            </div>
          )}
        </div>

        <Button onClick={save} className="w-full md:w-auto">
          Save Student
        </Button>
      </div>

      {/* 🧍‍♂️ Students Table */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Students List</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-green-100 text-left">
                <th className="p-3">Name</th>
                <th className="p-3">Roll</th>
                <th className="p-3">Email</th>
                <th className="p-3">Syllabus</th>
                <th className="p-3">Teachers</th>
                <th className="p-3">Fee</th>
                <th className="p-3">Status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t hover:bg-gray-50 transition">
                  <td className="p-3">{r.name}</td>
                  <td className="p-3">{r.roll_no}</td>
                  <td className="p-3">{r.email}</td>
                  <td className="p-3">{r.syllabus?.join(", ")}</td>
                  <td className="p-3">{r.teachers?.join(", ") || "—"}</td>
                  <td className="p-3">Rs {r.student_fee}</td>
                  <td
                    className={`p-3 font-medium ${
                      r.fee_status === "paid"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {r.fee_status}
                  </td>
                  <td className="p-3 flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleFee(r.id, r.fee_status)}
                    >
                      {r.fee_status === "paid" ? "Mark Unpaid" : "Mark Paid"}
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => del(r.id)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={8} className="text-center text-gray-500 p-4">
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
