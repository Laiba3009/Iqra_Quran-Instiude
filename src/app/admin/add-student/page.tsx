'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import BackButton from '@/components/ui/BackButton';

const COURSES = [
  'Urdu Language Course',
  'Quran Recitation Course',
  'Memorization of Quran',
  "Kid's Tarbiya Course",
  'Islamic Teaching',
  'Quran Ijazah Course',
  'Basic Qaida Online',
  'Quran Tajweed Course',
  'Quran Translation Course',
  'English Language Course',
];

export default function AddStudent() {
  const [form, setForm] = useState({
    name: '',
    roll_no: '',
    contact: '',
    email: '',
    courses: [] as string[],
    student_fee: '',
    fee_status: 'unpaid',
  });
  const [rows, setRows] = useState<any[]>([]);

  useEffect(() => {
    loadRows();
  }, []);

  const loadRows = async () => {
    const { data, error } = await supabase
      .from('students')
      .select('*')
      .order('created_at', { ascending: false });
    if (!error && data) setRows(data);
  };

  const toggleCourse = (name: string) => {
    setForm(prev => ({
      ...prev,
      courses: prev.courses.includes(name)
        ? prev.courses.filter(c => c !== name)
        : [...prev.courses, name],
    }));
  };

  const save = async () => {
    const payload = { ...form, student_fee: Number(form.student_fee || 0) };
    const { error } = await supabase.from('students').insert([payload]);
    if (error) {
      alert(error.message);
      return;
    }
    setForm({
      name: '',
      roll_no: '',
      contact: '',
      email: '',
      courses: [],
      student_fee: '',
      fee_status: 'unpaid',
    });
    await loadRows();
  };

  const toggleFee = async (id: string, status: string) => {
    const newStatus = status === 'paid' ? 'unpaid' : 'paid';
    await supabase.from('students').update({ fee_status: newStatus }).eq('id', id);
    await loadRows();
  };

  const del = async (id: string) => {
    await supabase.from('students').delete().eq('id', id);
    await loadRows();
  };

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-8 space-y-8">
      {/* ✅ Back Button (Always Top Left, clear spacing) */}
      <div className="mt-2">
        <BackButton href="/admin/dashboard" label="Back to Dashboard" />
      </div>

      {/* ✅ Add Student Form */}
      <div className="bg-white rounded-2xl shadow-lg p-6 space-y-6">
        <h1 className="text-3xl font-bold text-green-800">Add Student</h1>

        <div className="grid md:grid-cols-2 gap-4">
          <input
            className="border p-3 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
            placeholder="Full Name"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
          />
          <input
            className="border p-3 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
            placeholder="Roll No"
            value={form.roll_no}
            onChange={e => setForm({ ...form, roll_no: e.target.value })}
          />
          <input
            className="border p-3 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
            placeholder="Contact"
            value={form.contact}
            onChange={e => setForm({ ...form, contact: e.target.value })}
          />
          <input
            className="border p-3 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
            placeholder="Email"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
          />
          <input
            className="border p-3 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
            placeholder="Fee"
            value={form.student_fee}
            onChange={e => setForm({ ...form, student_fee: e.target.value })}
          />
        </div>

        {/* ✅ Courses Selection */}
        <div>
          <h2 className="font-semibold mb-2">Select Courses</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {COURSES.map(c => (
              <label
                key={c}
                className={`cursor-pointer border px-3 py-2 rounded-lg text-sm transition 
                  ${form.courses.includes(c) ? 'bg-green-100 border-green-600' : 'hover:bg-gray-50'}
                `}
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
        </div>

        <Button onClick={save} className="w-full md:w-auto">
          Save Student
        </Button>
      </div>

      {/* ✅ Students Table */}
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Students List</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-green-100 text-left">
                <th className="p-3">Name</th>
                <th className="p-3">Roll</th>
                <th className="p-3">Email</th>
                <th className="p-3">Courses</th>
                <th className="p-3">Fee</th>
                <th className="p-3">Status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.id} className="border-t hover:bg-gray-50 transition">
                  <td className="p-3">{r.name}</td>
                  <td className="p-3">{r.roll_no}</td>
                  <td className="p-3">{r.email}</td>
                  <td className="p-3">{r.courses?.join(', ')}</td>
                  <td className="p-3">Rs {r.student_fee}</td>
                  <td
                    className={`p-3 font-medium ${
                      r.fee_status === 'paid' ? 'text-green-600' : 'text-red-600'
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
                      {r.fee_status === 'paid' ? 'Mark Unpaid' : 'Mark Paid'}
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
                  <td colSpan={7} className="text-center text-gray-500 p-4">
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
