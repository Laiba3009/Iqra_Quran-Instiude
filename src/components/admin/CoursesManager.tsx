"use client";
import { useEffect, useState } from "react";

export default function CoursesManager() {
  const [name, setName] = useState("");
  const [courses, setCourses] = useState<any[]>([]);

  useEffect(()=>{ load(); },[]);

  async function load() {
    const res = await fetch("/api/courses");
    setCourses(await res.json());
  }

  async function add() {
    if (!name) return alert("Enter course name");
    await fetch("/api/courses", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name }) });
    setName("");
    load();
  }

  return (
    <div className="p-6 bg-white rounded-xl shadow">
      <h3 className="font-bold mb-3">Courses</h3>
      <div className="flex gap-2">
        <input value={name} onChange={e=>setName(e.target.value)} placeholder="New course name" className="border p-2 rounded flex-1" />
        <button onClick={add} className="bg-blue-600 text-white px-3 py-2 rounded">Add</button>
      </div>
      <ul className="mt-3 space-y-1">
        {courses.map(c => <li key={c.id} className="text-sm">{c.name}</li>)}
      </ul>
    </div>
  );
}
