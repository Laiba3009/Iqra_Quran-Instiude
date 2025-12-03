// Updated AddStudentForm with teacher fee, academy fee, join_date, auto calculations
"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function AddStudentForm() {
  const [form, setForm] = useState({
    name: "",
    roll_no: "",
    contact: "",
    email: "",
    courses: [] as string[],
    student_total_fee: "", // total fee user gives
    teacher_fee: "", // selected teacher fee
    academy_fee: 0,
    join_date: new Date().toISOString().split("T")[0],
    fee_status: "unpaid",
  
  });

  const [rows, setRows] = useState<any[]>([]);
  const [courses, setCourses] = useState<string[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);

  useEffect(() => {
    load();
    fetchCourses();
    fetchTeachers();
  }, []);

  async function fetchCourses() {
    const res = await fetch("/api/courses");
    const data = await res.json();
    setCourses((data || []).map((c: any) => c.name));
  }

  async function fetchTeachers() {
    const { data } = await supabase.from("teachers").select("id, name, teacher_fee");
    setTeachers(data || []);
  }

  async function load() {
    const { data } = await supabase
      .from("students")
      .select("*")
      .order("created_at", { ascending: false });
    setRows(data || []);
  }

  function toggleCourse(name: string) {
    setForm((prev) => ({
      ...prev,
      courses: prev.courses.includes(name)
        ? prev.courses.filter((c) => c !== name)
        : [...prev.courses, name],
    }));
  }

  function updateFees(newTeacherFee: string) {
    const studentFee = Number(form.student_total_fee || 0);
    const teacherFee = Number(newTeacherFee || 0);
    const academyFee = studentFee - teacherFee;

    setForm((prev) => ({
      ...prev,
      teacher_fee: newTeacherFee,
      academy_fee: academyFee >= 0 ? academyFee : 0,
    }));
  }

  async function save() {
    const payload = {
      name: form.name,
      roll_no: form.roll_no,
      contact: form.contact,
      email: form.email,
      courses: form.courses,
      student_total_fee: Number(form.student_total_fee),
      teacher_fee: Number(form.teacher_fee),
      academy_fee: Number(form.academy_fee),
      total_fee: Number(form.student_total_fee),
      join_date: form.join_date,
      fee_status: form.fee_status,
    };

    const { error } = await supabase.from("students").insert([payload]);
    if (error) return alert(error.message);

    setForm({
      name: "",
      roll_no: "",
      contact: "",
      email: "",
      courses: [],
      student_total_fee: "",
      teacher_fee: "",
      academy_fee: 0,
      join_date: new Date().toISOString().split("T")[0],
      fee_status: "unpaid",
    });

    load();
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Add Student</h2>

      <input placeholder="Name" className="border p-2 w-full" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />

      <input placeholder="Roll No" className="border p-2 w-full" value={form.roll_no} onChange={(e) => setForm({ ...form, roll_no: e.target.value })} />

      <input placeholder="Contact" className="border p-2 w-full" value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} />

      <input placeholder="Email" className="border p-2 w-full" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />

      {/* join date */}
      <label className="block font-semibold">Joining Date</label>
      <input type="date" className="border p-2 w-full" value={form.join_date} onChange={(e) => setForm({ ...form, join_date: e.target.value })} />

      {/* student total fee */}
      <label className="block font-semibold">Student Total Fee</label>
      <input
        type="number"
        className="border p-2 w-full"
        value={form.student_total_fee}
        onChange={(e) => setForm({ ...form, student_total_fee: e.target.value })}
      />

      {/* teacher dropdown */}
      <label className="block font-semibold">Select Teacher</label>
      <select
        className="border p-2 w-full"
        value={form.teacher_fee}
        onChange={(e) => updateFees(e.target.value)}
      >
        <option value="">Select Teacher</option>
        {teachers.map((t) => (
          <option key={t.id} value={t.teacher_fee}>
            {t.name} — Fee: {t.teacher_fee}
          </option>
        ))}
      </select>

      {/* academy fee auto */}
      <p className="font-bold">Academy Fee: {form.academy_fee}</p>

      {/* courses */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
        {courses.map((c) => (
          <label
            key={c}
            className={`cursor-pointer border px-3 py-2 rounded ${form.courses.includes(c) ? "bg-green-100 border-green-600" : "hover:bg-gray-50"}`}
          >
            <input
              type="checkbox"
              className="hidden"
              checked={form.courses.includes(c)}
              onChange={() => toggleCourse(c)}
            />
            {c}
          </label>
        ))}
      </div>

      <button onClick={save} className="bg-green-600 text-white px-4 py-2 rounded">
        Save Student
      </button>

      {/* list students */}
      <div>
        <h3 className="font-semibold mt-6">Students</h3>
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-2">Name</th>
              <th className="p-2">Email</th>
              <th className="p-2">Courses</th>
              <th className="p-2">Join Date</th>
              <th className="p-2">Academy Fee</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td className="p-2">{r.name}</td>
                <td className="p-2">{r.email}</td>
                <td className="p-2">{(r.courses || []).join(", ")}</td>
                <td className="p-2">{r.join_date}</td>
                <td className="p-2">{r.academy_fee}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}