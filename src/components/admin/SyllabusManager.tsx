"use client";
import { useEffect, useState } from "react";

type Entry = {
  id?: string;
  course_name: string;
  grade?: string;
  title?: string;
  topics?: string[];
  description?: string;
};

export default function SyllabusManager() {
  const [courses, setCourses] = useState<string[]>([]);
  const [list, setList] = useState<Entry[]>([]);
  const [form, setForm] = useState<Entry>({ course_name: "", grade: "", title: "", topics: [], description: "" });
  const [editId, setEditId] = useState<string | null>(null);

  useEffect(() => {
    load();
    fetchCourses();
  }, []);

  async function fetchCourses() {
    const res = await fetch("/api/courses");
    const data = await res.json();
    setCourses((data || []).map((c: any) => c.name));
  }

  async function load() {
    const res = await fetch("/api/syllabus");
    const data = await res.json();
    setList(data || []);
  }

  async function save() {
    const payload = {
      course_name: form.course_name,
      grade: form.grade,
      title: form.title,
      topics: form.topics || [],
      description: form.description,
    };
    if (editId) {
      await fetch("/api/syllabus", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: editId, ...payload }) });
    } else {
      await fetch("/api/syllabus", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    }
    setForm({ course_name: "", grade: "", title: "", topics: [], description: "" });
    setEditId(null);
    load();
  }

  function startEdit(e: Entry) {
    setEditId(e.id || null);
    setForm({ course_name: e.course_name, grade: e.grade, title: e.title, topics: e.topics || [], description: e.description });
  }

  async function remove(id?: string) {
    if (!id) return;
    await fetch("/api/syllabus", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    load();
  }

  return (
    <div className="p-6 bg-white rounded-xl shadow">
      <h2 className="text-xl font-bold mb-4">Manage Syllabus</h2>

      <div className="grid gap-2 md:grid-cols-2">
        <select value={form.course_name} onChange={e=>setForm({...form, course_name: e.target.value})} className="border p-2 rounded">
          <option value="">Select Course</option>
          {courses.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        <input placeholder="Grade" value={form.grade} onChange={e=>setForm({...form, grade: e.target.value})} className="border p-2 rounded" />

        <input placeholder="Title" value={form.title} onChange={e=>setForm({...form, title: e.target.value})} className="border p-2 rounded col-span-2" />

        <textarea placeholder="Topics (comma separated)" value={(form.topics||[]).join(", ")} onChange={e=>setForm({...form, topics: e.target.value.split(",").map(s=>s.trim())})} className="border p-2 rounded col-span-2" />

        <textarea placeholder="Description (optional)" value={form.description} onChange={e=>setForm({...form, description: e.target.value})} className="border p-2 rounded col-span-2" />

        <div className="col-span-2 flex gap-2">
          <button onClick={save} className="bg-green-600 text-white px-4 py-2 rounded">{editId ? "Update" : "Add"}</button>
          <button onClick={()=>{ setForm({ course_name:"", grade:"", title:"", topics:[], description:"" }); setEditId(null); }} className="px-4 py-2 border rounded">Reset</button>
        </div>
      </div>

      <hr className="my-4" />

      <div className="space-y-2">
        {(list || []).map(item => (
          <div key={item.id} className="p-3 border rounded flex justify-between items-start">
            <div>
              <div className="font-semibold">{item.course_name} — {item.grade} — {item.title}</div>
              <div className="text-sm text-gray-600">{(item.topics||[]).join(", ")}</div>
            </div>
            <div className="flex gap-2">
              <button onClick={()=>startEdit(item)} className="px-2 py-1 border rounded">Edit</button>
              <button onClick={()=>remove(item.id)} className="px-2 py-1 bg-red-500 text-white rounded">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}