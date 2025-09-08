'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { COURSES } from '@/constants/courses';
import { Button } from '@/components/ui/button';

export default function AddTeacher(){
  const [courseMap, setCourseMap] = useState<{[name:string]:number}>({});
  const [form, setForm] = useState({ name:'', contact:'', email:'', course_id: 0, salary: '' });
  const [rows, setRows] = useState<any[]>([]);

  useEffect(()=>{ loadCourses(); loadRows(); },[]);

  const loadCourses = async () => {
    const { data } = await supabase.from('courses').select('id,name');
    const map: any = {};
    data?.forEach(c => map[c.name] = c.id);
    setCourseMap(map);
  };

  const loadRows = async () => {
    const { data } = await supabase.from('teachers').select('*').order('id',{ascending:false});
    setRows(data ?? []);
  };

  const save = async () => {
    const payload = { ...form, salary: Number(form.salary||0) };
    const { error } = await supabase.from('teachers').insert([payload]);
    if(error){ alert(error.message); return; }
    setForm({ name:'', contact:'', email:'', course_id: 0, salary: '' });
    await loadRows();
  };

  return (
    <div className="space-y-4 max-w-2xl">
      <h1 className="text-2xl font-bold">Add Teacher</h1>
      <input className="border p-2 w-full rounded" placeholder="Name" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} />
      <input className="border p-2 w-full rounded" placeholder="Contact" value={form.contact} onChange={e=>setForm({...form, contact:e.target.value})} />
      <input className="border p-2 w-full rounded" placeholder="Email" value={form.email} onChange={e=>setForm({...form, email:e.target.value})} />
      <select className="border p-2 w-full rounded" value={form.course_id} onChange={e=>setForm({...form, course_id: Number(e.target.value)})}>
        <option value={0}>Select Course</option>
        {COURSES.map(c=> <option key={c} value={courseMap[c]||0}>{c}</option>)}
      </select>
      <input className="border p-2 w-full rounded" placeholder="Salary" value={form.salary} onChange={e=>setForm({...form, salary:e.target.value})} />
      <Button onClick={save} className="bg-green-600 hover:bg-green-700">Save Teacher</Button>

      <h2 className="text-xl font-semibold mt-8">Teachers</h2>
      <div className="bg-white border rounded-lg overflow-auto">
        <table className="w-full text-sm">
          <thead><tr className="bg-gray-100">
            <th className="p-2 text-left">Name</th><th className="p-2 text-left">Email</th><th className="p-2 text-left">Salary</th>
          </tr></thead>
          <tbody>
            {rows.map(r=> (
              <tr key={r.id} className="border-t">
                <td className="p-2">{r.name}</td>
                <td className="p-2">{r.email}</td>
                <td className="p-2">{r.salary}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
