'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { COURSES } from '@/constants/courses';
import { Button } from '@/components/ui/button';

export default function AddStudent(){
  const [form, setForm] = useState({ name:'', roll_no:'', contact:'', email:'', course_ids: [] as number[], student_fee: '' });
  const [courseMap, setCourseMap] = useState<{[name:string]:number}>({});
  const [rows, setRows] = useState<any[]>([]);

  useEffect(()=>{ loadCourses(); loadRows(); },[]);

  const loadCourses = async () => {
    const { data } = await supabase.from('courses').select('id,name');
    const map: any = {};
    data?.forEach(c => map[c.name] = c.id);
    setCourseMap(map);
  };

  const loadRows = async () => {
    const { data } = await supabase.from('students').select('*').order('id',{ascending:false});
    setRows(data ?? []);
  };

  const toggleCourse = (name:string) => {
    const id = courseMap[name];
    if(!id) return;
    setForm(prev => ({
      ...prev,
      course_ids: prev.course_ids.includes(id) ? prev.course_ids.filter(i=>i!==id) : [...prev.course_ids, id]
    }));
  };

  const save = async () => {
    const payload = {...form, student_fee: Number(form.student_fee||0)};
    const { error } = await supabase.from('students').insert([payload]);
    if(error){ alert(error.message); return; }
    setForm({ name:'', roll_no:'', contact:'', email:'', course_ids: [], student_fee: '' });
    await loadRows();
  };

  return (
    <div className="space-y-4 max-w-2xl">
      <h1 className="text-2xl font-bold">Add Student</h1>
      <input className="border p-2 w-full rounded" placeholder="Name" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} />
      <input className="border p-2 w-full rounded" placeholder="Roll No" value={form.roll_no} onChange={e=>setForm({...form, roll_no:e.target.value})} />
      <input className="border p-2 w-full rounded" placeholder="Contact" value={form.contact} onChange={e=>setForm({...form, contact:e.target.value})} />
      <input className="border p-2 w-full rounded" placeholder="Email" value={form.email} onChange={e=>setForm({...form, email:e.target.value})} />
      <input className="border p-2 w-full rounded" placeholder="Fee" value={form.student_fee} onChange={e=>setForm({...form, student_fee:e.target.value})} />
      <div>
        <h2 className="font-semibold mb-2">Select Courses</h2>
        <div className="grid grid-cols-2 gap-2">
          {COURSES.map(c=>(
            <label key={c} className="flex items-center gap-2">
              <input type="checkbox" checked={form.course_ids.includes(courseMap[c])} onChange={()=>toggleCourse(c)} />
              {c}
            </label>
          ))}
        </div>
      </div>
      <Button onClick={save}>Save Student</Button>

      <h2 className="text-xl font-semibold mt-8">Students</h2>
      <div className="bg-white border rounded-lg overflow-auto">
        <table className="w-full text-sm">
          <thead><tr className="bg-gray-100">
            <th className="p-2 text-left">Name</th><th className="p-2 text-left">Roll</th><th className="p-2 text-left">Email</th><th className="p-2 text-left">Fee</th>
          </tr></thead>
          <tbody>
            {rows.map(r=> (
              <tr key={r.id} className="border-t">
                <td className="p-2">{r.name}</td>
                <td className="p-2">{r.roll_no}</td>
                <td className="p-2">{r.email}</td>
                <td className="p-2">{r.student_fee}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
