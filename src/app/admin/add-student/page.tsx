'use client';

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import BackButton from "@/components/ui/BackButton";
import { useToast } from "@/components/ui/use-toast";

export default function AddStudent() {
  const [form, setForm] = useState({
    id: "",
    name: "",
    roll_no: "",
    contact: "",
    email: "",
    syllabus: [] as string[],
    academy_fee: "",
    student_total_fee: "",
    class_time: "",
    fee_status: "unpaid",
    join_date: "",
  });

  const [teacherList, setTeacherList] = useState<
    { id: string; name: string; email: string; amount?: number; selected?: boolean }[]
  >([]);
  const [rows, setRows] = useState<any[]>([]);
  const [editing, setEditing] = useState(false);
  const { toast } = useToast();

  const syllabusList = ["Quran", "Islamic Studies", "Tafseer", "Urdu", "English"];

  useEffect(() => {
    loadRows();
    loadTeachers();
  }, []);

  // Load students + teachers + total
  const loadRows = async () => {
    const { data: students } = await supabase.from("students").select("*").order("created_at", { ascending: false });
    if (!students) return;

    const fullData = await Promise.all(
      students.map(async (s) => {
        const { data: teacherMap } = await supabase
          .from("student_teachers")
          .select("teacher_fee, teachers(name)")
          .eq("student_id", s.id);

        const totalTeacherFee = teacherMap?.reduce((sum, t) => sum + Number(t.teacher_fee || 0), 0) || 0;
        const totalFee = Number(s.academy_fee || 0) + totalTeacherFee;

        return {
          ...s,
          teacherNames: teacherMap?.map((m) => `${m.teachers?.name} (Rs ${m.teacher_fee})`) || [],
          teacherFee: totalTeacherFee,
          totalFee: s.student_total_fee || totalFee,
        };
      })
    );

    setRows(fullData);
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

  const toggleTeacher = (teacherId: string) => {
    setTeacherList((prev) =>
      prev.map((t) => (t.id === teacherId ? { ...t, selected: !t.selected } : t))
    );
  };

  const handleTeacherFeeChange = (teacherId: string, value: string) => {
    setTeacherList((prev) =>
      prev.map((t) => (t.id === teacherId ? { ...t, amount: Number(value) || 0 } : t))
    );
  };

  const save = async () => {
    if (!form.name || !form.roll_no || !form.academy_fee) {
      alert("Please fill all required fields.");
      return;
    }

    const selectedTeachers = teacherList.filter((t) => t.selected);
    const totalTeacherFee = selectedTeachers.reduce((sum, t) => sum + (t.amount || 0), 0);
    const totalFee = Number(form.academy_fee || 0) + totalTeacherFee;

    const payload = {
      name: form.name,
      roll_no: form.roll_no,
      contact: form.contact,
      email: form.email,
      syllabus: form.syllabus,
      academy_fee: Number(form.academy_fee),
      class_time: form.class_time,
      student_total_fee: totalFee,
      fee_status: form.fee_status,
      join_date: form.join_date || null,
    };

    if (editing) {
      await supabase.from("students").update(payload).eq("id", form.id);
      await supabase.from("student_teachers").delete().eq("student_id", form.id);
      if (selectedTeachers.length > 0) {
        const map = selectedTeachers.map((t) => ({
          student_id: form.id,
          teacher_id: t.id,
          teacher_fee: t.amount || 0,
        }));
        await supabase.from("student_teachers").insert(map);
      }
      toast({ title: "✅ Student updated successfully" });
    } else {
      const { data: inserted, error } = await supabase.from("students").insert([payload]).select().single();
      if (error) return alert(error.message);
      if (selectedTeachers.length > 0) {
        const map = selectedTeachers.map((t) => ({
          student_id: inserted.id,
          teacher_id: t.id,
          teacher_fee: t.amount || 0,
        }));
        await supabase.from("student_teachers").insert(map);
      }
      toast({ title: "✅ Student added successfully" });
    }

    setForm({
      id: "",
      name: "",
      roll_no: "",
      contact: "",
      email: "",
      syllabus: [],
      academy_fee: "",
      student_total_fee: "",
      class_time: "",
      fee_status: "unpaid",
      join_date: "",
    });
    setTeacherList((t) => t.map((x) => ({ ...x, selected: false, amount: 0 })));
    setEditing(false);
    await loadRows();
  };

  const editStudent = async (student: any) => {
    const { data: map } = await supabase.from("student_teachers").select("teacher_id, teacher_fee").eq("student_id", student.id);
    setForm({
      id: student.id,
      name: student.name,
      roll_no: student.roll_no,
      contact: student.contact,
      email: student.email,
      syllabus: student.syllabus ?? [],
      academy_fee: student.academy_fee,
      student_total_fee: student.student_total_fee,
      class_time: student.class_time ?? "",
      fee_status: student.fee_status,
      join_date: student.join_date ?? "",
    });

    setTeacherList((prev) =>
      prev.map((t) => {
        const found = map?.find((m) => m.teacher_id === t.id);
        return found ? { ...t, selected: true, amount: found.teacher_fee } : { ...t, selected: false, amount: 0 };
      })
    );

    setEditing(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleFee = async (id: string, status: string) => {
    const newStatus = status === "paid" ? "unpaid" : "paid";
    await supabase.from("students").update({ fee_status: newStatus }).eq("id", id);
    await loadRows();
  };

  const del = async (id: string) => {
    if (!confirm("Are you sure to delete?")) return;
    await supabase.from("student_teachers").delete().eq("student_id", id);
    await supabase.from("students").delete().eq("id", id);
    await loadRows();
  };

  return (
    <div className="bg-blue-100 min-h-screen py-12 mt-8 px-4 md:px-8 space-y-8">
      <BackButton href="/admin/dashboard" label="Back" />

      {/* Form */}
      <div className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
        <h1 className="text-3xl font-bold text-green-800">{editing ? "Edit Student" : "Add Student"}</h1>

        <div className="grid md:grid-cols-2 gap-4">
          <input className="border p-3 rounded-lg" placeholder="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input className="border p-3 rounded-lg" placeholder="Roll No" value={form.roll_no} onChange={(e) => setForm({ ...form, roll_no: e.target.value })} />
          <input className="border p-3 rounded-lg" placeholder="Contact" value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} />
          <input className="border p-3 rounded-lg" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input className="border p-3 rounded-lg" placeholder="Academy Fee" value={form.academy_fee} onChange={(e) => setForm({ ...form, academy_fee: e.target.value })} />
          <input className="border p-3 rounded-lg" placeholder="Class Time" value={form.class_time} onChange={(e) => setForm({ ...form, class_time: e.target.value })} />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <input className="border p-3 rounded-lg" placeholder="Total Student Fee" value={form.student_total_fee} onChange={(e) => setForm({ ...form, student_total_fee: e.target.value })} />
        </div>
        {/* Syllabus Selection */}
<div>
  <h3 className="font-semibold mb-2 text-gray-700">Select Syllabus</h3>
  <div className="flex flex-wrap gap-2">
    {syllabusList.map((s) => (
      <button
        key={s}
        type="button"
        onClick={() => toggleSyllabus(s)}
        className={`px-3 py-1 rounded-full border text-sm ${
          form.syllabus.includes(s)
            ? "bg-green-600 text-white border-green-600"
            : "bg-white text-gray-700 border-gray-300 hover:bg-green-50"
        }`}
      >
        {s}
      </button>
    ))}
  </div>
    </div>


        {/* Teachers */}
        <div>
          <h2 className="font-semibold mb-2 text-gray-700">Assign Teachers & Fees</h2>
          <div className="space-y-2">
            {teacherList.map((t) => (
              <div key={t.id} className={`flex items-center justify-between border rounded-lg px-3 py-2 ${t.selected ? "bg-green-50 border-green-500" : ""}`}>
                <div className="flex items-center gap-2">
                  <input type="checkbox" checked={!!t.selected} onChange={() => toggleTeacher(t.id)} />
                  <span>{t.name}</span>
                </div>
                {t.selected && (
                  <input
                    type="number"
                    placeholder="Fee"
                    className="border p-1 rounded w-24"
                    value={t.amount || ""}
                    onChange={(e) => handleTeacherFeeChange(t.id, e.target.value)}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <Button onClick={save} className="bg-green-600 text-white hover:bg-green-700">
          {editing ? "Update Student" : "Save Student"}
        </Button>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
        <h2 className="text-2xl font-bold text-gray-800">Students List</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-green-100 text-left">
                <th className="p-3">Name</th>
                <th className="p-3">Roll</th>
                <th className="p-3">Class Time</th>
                <th className="p-3">Teachers</th>
                <th className="p-3 text-purple-700">Teacher Fee</th>
                <th className="p-3 text-blue-700">Academy Fee</th>
                <th className="p-3 text-green-700">Student Total Fee</th>
                <th className="p-3">Status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t hover:bg-gray-50">
                  <td className="p-3">{r.name}</td>
                  <td className="p-3">{r.roll_no}</td>
                  <td className="p-3">{r.class_time || "—"}</td>
                  <td className="p-3 text-purple-600 font-medium">{r.teacherNames.join(", ") || "—"}</td>
                  <td className="p-3 text-purple-700 font-semibold">Rs {r.teacherFee}</td>
                  <td className="p-3 text-blue-700 font-semibold">Rs {r.academy_fee}</td>
                  <td className="p-3 text-green-700 font-bold">Rs {r.student_total_fee || 0}</td>
                  <td className={`p-3 font-medium ${r.fee_status === "paid" ? "text-green-600" : "text-red-600"}`}>{r.fee_status}</td>
                  <td className="p-3 flex gap-2 flex-wrap">
        <Button size="sm" variant="outline" title="Edit student" onClick={() => editStudent(r)}>
  Edit
</Button>

<Button size="sm" variant="outline" title="Toggle fee status" onClick={() => toggleFee(r.id, r.fee_status)}>
  Toggle Fee
</Button>

<Button size="sm" variant="destructive" title="Delete student" onClick={() => del(r.id)}>
  Delete
</Button>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={9} className="text-center text-gray-500 p-4">No students found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}