'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import BackButton from '@/components/ui/BackButton';

export default function AddTeacher() {
  const [form, setForm] = useState({
    name: '',
    contact: '',
    email: '',
    salary: ''
  });
  const [rows, setRows] = useState<any[]>([]);

  useEffect(() => {
    loadRows();
  }, []);

  // Load teachers
  const loadRows = async () => {
    const { data } = await supabase
      .from('teachers')
      .select('*')
      .order('created_at', { ascending: false });
    setRows(data ?? []);
  };

  // Save teacher
  const save = async () => {
    const payload = {
      ...form,
      salary: Number(form.salary || 0),
      salary_status: 'unpaid'
    };
    const { error } = await supabase.from('teachers').insert([payload]);
    if (error) {
      alert(error.message);
      return;
    }
    setForm({ name: '', contact: '', email: '', salary: '' });
    await loadRows();
  };

  // Toggle salary status
  const toggleSalary = async (id: string, status: string) => {
    const newStatus = status === 'paid' ? 'unpaid' : 'paid';
    await supabase.from('teachers').update({ salary_status: newStatus }).eq('id', id);
    await loadRows();
  };

  // Delete teacher
  const del = async (id: string) => {
    await supabase.from('teachers').delete().eq('id', id);
    await loadRows();
  };

  return (
    <div className="max-w-5xl mx-auto mt-20 p-6 space-y-8">
      {/* Back Button */}
      <BackButton href="/admin/dashboard" label="Back to Dashboard" />

      {/* Form Section */}
      <div className="bg-white shadow-lg rounded-2xl p-6 space-y-6">
        <h1 className="text-3xl font-bold text-green-800">Add Teacher</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            className="border p-3 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
            placeholder="Full Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
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
            placeholder="Salary"
            value={form.salary}
            onChange={(e) => setForm({ ...form, salary: e.target.value })}
          />
        </div>

        <Button
          onClick={save}
          className="bg-green-600 hover:bg-green-700 w-full md:w-auto"
        >
          Save Teacher
        </Button>
      </div>

      {/* Teachers List */}
      <div className="bg-white shadow-lg rounded-2xl p-6">
        <h2 className="text-2xl font-semibold mb-4">Teachers List</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-green-100 text-left">
                <th className="p-3">Name</th>
                <th className="p-3">Contact</th>
                <th className="p-3">Email</th>
                <th className="p-3">Salary</th>
                <th className="p-3">Status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr
                  key={r.id}
                  className="border-t hover:bg-gray-50 transition"
                >
                  <td className="p-3">{r.name}</td>
                  <td className="p-3">{r.contact}</td>
                  <td className="p-3">{r.email}</td>
                  <td className="p-3">Rs {r.salary}</td>
                  <td
                    className={`p-3 font-semibold ${
                      r.salary_status === 'paid'
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}
                  >
                    {r.salary_status}
                  </td>
                  <td className="p-3 flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleSalary(r.id, r.salary_status)}
                    >
                      {r.salary_status === 'paid'
                        ? 'Mark Unpaid'
                        : 'Mark Paid'}
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
                  <td
                    colSpan={6}
                    className="p-4 text-center text-gray-500"
                  >
                    No teachers added yet.
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
