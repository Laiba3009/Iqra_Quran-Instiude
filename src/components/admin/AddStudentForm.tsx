"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

const COURSES = [
  // you can fetch dynamically from /api/courses instead of hardcoding
];

export default function AddStudentForm(){
  const [form, setForm] = useState({ name:"", roll_no:"", contact:"", email:"", courses: [] as string[], student_fee:"", fee_status:"unpaid" });
  const [rows, setRows] = useState<any[]>([]);
  const [courses, setCourses] = useState<string[]>([]);

  useEffect(()=>{ load(); fetchCourses(); },[]);

  async function fetchCourses(){
    const res = await fetch("/api/courses");
    const data = await res.json();
    setCourses((data||[]).map((c:any)=>c.name));
  }

  async function load(){
    const { data } = await supabase.from("students").select("*").order("created_at", { ascending: false });
    setRows(data || []);
  }

  function toggleCourse(name:string){
    setForm(prev => ({ ...prev, courses: prev.courses.includes(name) ? prev.courses.filter(c=>c!==name) : [...prev.courses, name] }));
  }

  async function save(){
    const payload = { ...form, student_fee: Number(form.student_fee || 0) };
    const { error } = await supabase.from("students").insert([payload]);
    if (error) return alert(error.message);
    setForm({ name:"", roll_no:"", contact:"", email:"", courses:[], student_fee:"", fee_status:"unpaid" });
    load();
  }

  return (
    <div className="space-y-4">
      {/* form UI similar to your provided code */}
      {/* show courses dynamically */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
        {courses.map(c => (
          <label key={c} className={`cursor-pointer border px-3 py-2 rounded ${form.courses.includes(c) ? 'bg-green-100 border-green-600' : 'hover:bg-gray-50'}`}>
            <input type="checkbox" className="hidden" checked={form.courses.includes(c)} onChange={()=>toggleCourse(c)} />
            {c}
          </label>
        ))}
      </div>

      <button onClick={save} className="bg-green-600 text-white px-4 py-2 rounded">Save Student</button>

      {/* list students - simple */}
      <div>
        <h3 className="font-semibold">Students</h3>
        <table className="w-full">
          <thead><tr><th>Name</th><th>Email</th><th>Courses</th></tr></thead>
          <tbody>
            {rows.map(r=>(
              <tr key={r.id}><td>{r.name}</td><td>{r.email}</td><td>{(r.courses||[]).join(", ")}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}