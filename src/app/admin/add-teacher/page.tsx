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
    salary: '',
    roll_no: '',
    zoom_link: '',
    courses: [] as string[], // selected courses from the list
  });

  const [rows, setRows] = useState<any[]>([]);
  const [courseList, setCourseList] = useState<any[]>([]);

  // 🔹 Load teachers & available courses from DB
  useEffect(() => {
    loadRows();
    loadCourses();
  }, []);

  // Fetch existing teachers
  const loadRows = async () => {
    const { data } = await supabase
      .from('teachers')
      .select('*')
      .order('created_at', { ascending: false });
    setRows(data ?? []);
  };

  // Fetch available courses list
  const loadCourses = async () => {
    const { data } = await supabase.from('courses').select('id, name');
    setCourseList(data ?? []);
  };

  // ✅ Save new teacher
  const save = async () => {
    if (!form.name || !form.roll_no || form.courses.length === 0 || !form.zoom_link) {
      alert('Please fill all required fields (including Zoom Link).');
      return;
    }

    const payload = {
      name: form.name,
      contact: form.contact,
      email: form.email,
      roll_no: form.roll_no,
      zoom_link: form.zoom_link,
      salary: Number(form.salary || 0),
      salary_status: 'unpaid',
      syllabus: form.courses, // ✅ rename courses → syllabus (for StudentDashboard)
    };

    const { error } = await supabase.from('teachers').insert([payload]);
    if (error) {
      alert(error.message);
      return;
    }

    setForm({
      name: '',
      contact: '',
      email: '',
      salary: '',
      roll_no: '',
      zoom_link: '',
      courses: [],
    });

    await loadRows();
    alert('✅ Teacher added successfully!');
  };

  // ✅ Toggle salary paid/unpaid
  const toggleSalary = async (id: string, status: string) => {
    const newStatus = status === 'paid' ? 'unpaid' : 'paid';
    await supabase.from('teachers').update({ salary_status: newStatus }).eq('id', id);
    await loadRows();
  };

  // ✅ Delete a teacher
  const del = async (id: string) => {
    if (confirm('Are you sure you want to delete this teacher?')) {
      await supabase.from('teachers').delete().eq('id', id);
      await loadRows();
    }
  };

  // ✅ Handle course selection toggle
  const handleCourseSelect = (courseName: string) => {
    setForm((prev) => ({
      ...prev,
      courses: prev.courses.includes(courseName)
        ? prev.courses.filter((c) => c !== courseName)
        : [...prev.courses, courseName],
    }));
  };

  // ----------------------------
  // ✅ UI
  // ----------------------------
  return (
    <div className="max-w-5xl mx-auto mt-20 p-6 space-y-8">
      <BackButton href="/admin/dashboard" label="Back to Dashboard" />

      {/* Add Teacher Form */}
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
          <input
            className="border p-3 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
            placeholder="Teacher Roll No"
            value={form.roll_no}
            onChange={(e) => setForm({ ...form, roll_no: e.target.value })}
          />
          <input
            className="border p-3 rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
            placeholder="Zoom Meeting Link"
            value={form.zoom_link}
            onChange={(e) => setForm({ ...form, zoom_link: e.target.value })}
          />
        </div>

        {/* Multi Course Selection */}
        <div>
          <h3 className="font-semibold mb-2 text-gray-700">Select Courses</h3>
          <div className="flex flex-wrap gap-2">
            {courseList.map((course) => (
              <button
                key={course.id}
                type="button"
                onClick={() => handleCourseSelect(course.name)}
                className={`px-3 py-1 rounded-full border ${
                  form.courses.includes(course.name)
                    ? 'bg-green-600 text-white border-green-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-green-50'
                }`}
              >
                {course.name}
              </button>
            ))}
          </div>
        </div>

        <Button onClick={save} className="bg-green-600 hover:bg-green-700 w-full md:w-auto">
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
                <th className="p-3">Roll No</th>
                <th className="p-3">Name</th>
                <th className="p-3">Courses</th>
                <th className="p-3">Salary</th>
                <th className="p-3">Status</th>
                <th className="p-3">Zoom Link</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-t hover:bg-gray-50 transition">
                  <td className="p-3">{r.roll_no}</td>
                  <td className="p-3">{r.name}</td>
                  <td className="p-3">
                    {Array.isArray(r.syllabus)
                      ? r.syllabus.join(', ')
                      : r.syllabus || '—'}
                  </td>
                  <td className="p-3">Rs {r.salary}</td>
                  <td
                    className={`p-3 font-semibold ${
                      r.salary_status === 'paid' ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {r.salary_status}
                  </td>
                  <td className="p-3 text-blue-600 truncate max-w-[150px]">
                    {r.zoom_link ? (
                      <a href={r.zoom_link} target="_blank" rel="noopener noreferrer">
                        Join
                      </a>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="p-3 flex flex-wrap gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => toggleSalary(r.id, r.salary_status)}
                    >
                      {r.salary_status === 'paid' ? 'Mark Unpaid' : 'Mark Paid'}
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => del(r.id)}>
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-4 text-center text-gray-500">
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
