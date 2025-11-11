"use client";

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
    class_days: [] as { day: string; subject: string; time: string }[],
  });

  const [teacherList, setTeacherList] = useState<
    { id: string; name: string; email: string; amount?: number; selected?: boolean }[]
  >([]);
  const [rows, setRows] = useState<any[]>([]);
  const [editing, setEditing] = useState(false);
  const [search, setSearch] = useState("");
  const { toast } = useToast();

  const syllabusList = ["Quran", "Islamic Studies", "Tafseer", "Urdu", "English"];
  const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

  useEffect(() => {
    loadRows();
    loadTeachers();
  }, []);

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

  const toggleClassDay = (day: string) => {
    setForm((prev) => {
      const exists = prev.class_days.find((d) => d.day === day);
      if (exists) {
        return { ...prev, class_days: prev.class_days.filter((d) => d.day !== day) };
      } else {
        return { ...prev, class_days: [...prev.class_days, { day, subject: "", time: "" }] };
      }
    });
  };

  const handleDayChange = (day: string, field: "subject" | "time", value: string) => {
    setForm((prev) => ({
      ...prev,
      class_days: prev.class_days.map((d) =>
        d.day === day ? { ...d, [field]: value } : d
      ),
    }));
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
      class_days: form.class_days,
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
      class_days: [],
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
      class_days: student.class_days ?? [],
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

  const filteredRows = rows.filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.roll_no.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-blue-100 min-h-screen py-12 px-4 md:px-8 space-y-8">
      <BackButton href="/admin/dashboard" label="Back" />

      {/* Form */}
      <div className="bg-white rounded-xl shadow-lg p-6 space-y-4 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-green-800">{editing ? "Edit Student" : "Add Student"}</h1>

        <div className="grid md:grid-cols-2 gap-3">
          <input className="border p-2 rounded-lg text-sm" placeholder="Full Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input className="border p-2 rounded-lg text-sm" placeholder="Roll No" value={form.roll_no} onChange={(e) => setForm({ ...form, roll_no: e.target.value })} />
          <input className="border p-2 rounded-lg text-sm" placeholder="Contact" value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} />
          <input className="border p-2 rounded-lg text-sm" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input className="border p-2 rounded-lg text-sm" placeholder="Academy Fee" value={form.academy_fee} onChange={(e) => setForm({ ...form, academy_fee: e.target.value })} />
          <input className="border p-2 rounded-lg text-sm" placeholder="Class Time" value={form.class_time} onChange={(e) => setForm({ ...form, class_time: e.target.value })} />
          <input type="date" className="border p-2 rounded-lg text-sm" value={form.join_date} onChange={(e) => setForm({ ...form, join_date: e.target.value })} />
        </div>

        <div>
          <h3 className="font-semibold mb-2 text-gray-700">Select Syllabus</h3>
          <div className="flex flex-wrap gap-2 mb-4">
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

          <h3 className="font-semibold mb-2 text-gray-700">Select Class Days & Time</h3>
          <div className="flex flex-wrap gap-2 mb-4">
            {weekDays.map((day) => {
              const selected = form.class_days.find((d) => d.day === day);
              return (
                <div key={day} className={`border rounded-lg px-2 py-1 ${selected ? "bg-green-50 border-green-500" : ""}`}>
                  <label className="flex items-center gap-1">
                    <input type="checkbox" checked={!!selected} onChange={() => toggleClassDay(day)} />
                    {day}
                  </label>
                  {selected && (
                    <div className="flex gap-1 mt-1">
                      <input type="text" placeholder="Subject" className="border p-1 rounded w-20 text-sm" value={selected.subject} onChange={(e) => handleDayChange(day, "subject", e.target.value)} />
                      <input type="time" className="border p-1 rounded w-20 text-sm" value={selected.time} onChange={(e) => handleDayChange(day, "time", e.target.value)} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <h3 className="font-semibold mb-2 text-gray-700">Assign Teachers & Fees</h3>
          <div className="flex flex-wrap gap-2 mb-4">
            {teacherList.map((t) => (
              <div key={t.id} className={`border rounded-lg p-2 ${t.selected ? "bg-green-50 border-green-500" : ""}`}>
                <label className="flex items-center gap-1">
                  <input type="checkbox" checked={!!t.selected} onChange={() => toggleTeacher(t.id)} />
                  {t.name}
                </label>
                {t.selected && (
                  <input type="number" placeholder="Fee" className="border p-1 rounded w-16 mt-1 text-sm" value={t.amount || ""} onChange={(e) => handleTeacherFeeChange(t.id, e.target.value)} />
                )}
              </div>
            ))}
          </div>
        </div>

        <Button onClick={save} className="bg-green-600 text-white hover:bg-green-700 w-full">
          {editing ? "Update Student" : "Save Student"}
        </Button>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4">
        <h2 className="text-2xl font-bold text-gray-800">Students List</h2>
        <input
          type="text"
          placeholder="Search by name or roll no..."
          className="border p-2 rounded-lg w-full text-sm mb-3"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-green-100 text-left">
                <th className="p-3">Name</th>
                <th className="p-3">Roll</th>
                <th className="p-3">Class Time</th>
                <th className="p-3">Class Days</th>
                <th className="p-3">Teachers</th>
                <th className="p-3 text-purple-700">Teacher Fee</th>
                <th className="p-3 text-blue-700">Academy Fee</th>
                <th className="p-3 text-green-700">Total Fee</th>
                <th className="p-3">Status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRows.map((r) => (
                <tr key={r.id} className="border-t hover:bg-gray-50">
                  <td className="p-3">{r.name}</td>
                  <td className="p-3">{r.roll_no}</td>
                  <td className="p-3">{r.class_time || "—"}</td>
                  <td className="p-3">
                    {Array.isArray(r.class_days)
                      ? r.class_days.map((d: any) => `${d.day} (${d.subject} - ${d.time || "—"})`).join(", ")
                      : "—"}
                  </td>
                  <td className="p-3 text-purple-600 font-medium">{r.teacherNames.join(", ") || "—"}</td>
                  <td className="p-3 text-purple-700 font-semibold">Rs {r.teacherFee}</td>
                  <td className="p-3 text-blue-700 font-semibold">Rs {r.academy_fee}</td>
                  <td className="p-3 text-green-700 font-bold">Rs {r.student_total_fee || 0}</td>
                  <td className={`p-3 font-medium ${r.fee_status === "paid" ? "text-green-600" : "text-red-600"}`}>{r.fee_status}</td>
                  <td className="p-3 flex gap-2 flex-wrap">
                    <Button size="sm" variant="outline" onClick={() => editStudent(r)}>Edit</Button>
                    <Button size="sm" variant="outline" onClick={() => toggleFee(r.id, r.fee_status)}>Toggle Fee</Button>
                    <Button size="sm" variant="destructive" onClick={() => del(r.id)}>Delete</Button>
                  </td>
                </tr>
              ))}
              {filteredRows.length === 0 && (
                <tr>
                  <td colSpan={10} className="text-center text-gray-500 p-4">
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
