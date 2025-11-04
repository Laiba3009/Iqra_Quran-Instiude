'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import BackButton from '@/components/ui/BackButton';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function AddTeacher() {
  const [form, setForm] = useState({
    id: '',
    name: '',
    contact: '',
    email: '',
    roll_no: '',
    zoom_link: '',
    syllabus: [] as string[],
    joining_date: '',
  });

  const [rows, setRows] = useState<any[]>([]);
  const [editing, setEditing] = useState(false);
  const [search, setSearch] = useState('');
  const [filterSubject, setFilterSubject] = useState('');

  const syllabusList = [
    'Quran',
    'Islamic Studies',
    'Quran Translation & Tafseer',
    'Urdu',
    'English',
  ];

  useEffect(() => {
    loadTeachers();
  }, []);

  const loadTeachers = async () => {
    const { data } = await supabase
      .from('teachers')
      .select('*')
      .order('created_at', { ascending: false });
    setRows(data ?? []);
  };

  const toggleSyllabus = (name: string) => {
    setForm((prev) => ({
      ...prev,
      syllabus: prev.syllabus.includes(name)
        ? prev.syllabus.filter((s) => s !== name)
        : [...prev.syllabus, name],
    }));
  };

  const save = async () => {
    if (!form.name || !form.roll_no || form.syllabus.length === 0) {
      alert('Please fill all required fields (Name, Roll No, and Syllabus).');
      return;
    }

    const payload = {
      name: form.name,
      contact: form.contact,
      email: form.email,
      roll_no: form.roll_no,
      zoom_link: form.zoom_link,
      syllabus: form.syllabus,
      joining_date: form.joining_date || null,
    };

    if (editing) {
      const { error } = await supabase.from('teachers').update(payload).eq('id', form.id);
      if (error) return alert(error.message);
    } else {
      const { error } = await supabase.from('teachers').insert([payload]);
      if (error) return alert(error.message);
    }

    setForm({
      id: '',
      name: '',
      contact: '',
      email: '',
      roll_no: '',
      zoom_link: '',
      syllabus: [],
      joining_date: '',
    });
    setEditing(false);
    await loadTeachers();
    alert(editing ? '✅ Teacher updated successfully!' : '✅ Teacher added successfully!');
  };

  const del = async (id: string) => {
    if (confirm('Are you sure you want to delete this teacher?')) {
      await supabase.from('teachers').delete().eq('id', id);
      await loadTeachers();
    }
  };

  const editTeacher = (teacher: any) => {
    setForm({
      id: teacher.id,
      name: teacher.name,
      contact: teacher.contact,
      email: teacher.email,
      roll_no: teacher.roll_no,
      zoom_link: teacher.zoom_link,
      syllabus: teacher.syllabus ?? [],
      joining_date: teacher.joining_date ?? '',
    });
    setEditing(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 🔽 Filter logic
  const filteredTeachers = rows.filter((t) => {
    const matchesSearch =
      t.name?.toLowerCase().includes(search.toLowerCase()) ||
      t.roll_no?.toLowerCase().includes(search.toLowerCase());
    const matchesSubject =
      !filterSubject || (Array.isArray(t.syllabus) && t.syllabus.includes(filterSubject));
    return matchesSearch && matchesSubject;
  });

  // ✅ Download PDF
  const downloadPDF = () => {
    if (filteredTeachers.length === 0) {
      alert('No teacher data to download!');
      return;
    }

    const doc = new jsPDF();
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('Teachers List Report', 14, 18);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 26);
    doc.text(`Total Teachers: ${filteredTeachers.length}`, 14, 32);

    const tableData = filteredTeachers.map((r, i) => [
      i + 1,
      r.roll_no,
      r.name,
      r.contact || '—',
      r.email || '—',
      Array.isArray(r.syllabus) ? r.syllabus.join(', ') : r.syllabus || '—',
      r.joining_date || '—',
    ]);

    autoTable(doc, {
      head: [['#', 'Roll No', 'Name', 'Contact', 'Email', 'Syllabus', 'Joining Date']],
      body: tableData,
      startY: 38,
      styles: { fontSize: 10, cellPadding: 4 },
      headStyles: { fillColor: [22, 160, 133] },
    });

    doc.save(`Teachers_${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <div className="max-w-6xl mx-auto mt-20 p-6 space-y-8">
      <BackButton href="/admin/dashboard" label="Back to Dashboard" />

      {/* Add/Edit Teacher Form */}
      <div className="bg-white shadow-lg rounded-2xl p-6 space-y-6">
        <h1 className="text-3xl font-bold text-green-800">
          {editing ? 'Edit Teacher' : 'Add Teacher'}
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            className="border p-3 rounded-lg outline-none"
            placeholder="Full Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            className="border p-3 rounded-lg outline-none"
            placeholder="Contact"
            value={form.contact}
            onChange={(e) => setForm({ ...form, contact: e.target.value })}
          />
          <input
            className="border p-3 rounded-lg outline-none"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            className="border p-3 rounded-lg outline-none"
            placeholder="Teacher Roll No"
            value={form.roll_no}
            onChange={(e) => setForm({ ...form, roll_no: e.target.value })}
          />
          <input
            type="date"
            className="border p-3 rounded-lg outline-none"
            value={form.joining_date}
            onChange={(e) => setForm({ ...form, joining_date: e.target.value })}
          />
          <input
            className="border p-3 rounded-lg outline-none"
            placeholder="Zoom Meeting Link"
            value={form.zoom_link}
            onChange={(e) => setForm({ ...form, zoom_link: e.target.value })}
          />
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
                    ? 'bg-green-600 text-white border-green-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-green-50'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <Button onClick={save} className="bg-green-600 hover:bg-green-700 w-full md:w-auto">
          {editing ? 'Update Teacher' : 'Save Teacher'}
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row justify-between gap-4 items-center">
        <input
          type="text"
          placeholder="🔍 Search by Name or Roll No"
          className="border p-3 rounded-lg w-full md:w-1/2"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="border p-3 rounded-lg w-full md:w-1/3"
          value={filterSubject}
          onChange={(e) => setFilterSubject(e.target.value)}
        >
          <option value="">📘 Filter by Subject</option>
          {syllabusList.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <Button onClick={downloadPDF} className="bg-blue-600 hover:bg-blue-700 text-white">
          📄 Download PDF
        </Button>
      </div>

      {/* Teachers List */}
      <div className="bg-white shadow-lg rounded-2xl p-6 space-y-4">
        <h2 className="text-2xl font-semibold">Teachers List</h2>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-green-100 text-left">
                <th className="p-3">Roll No</th>
                <th className="p-3">Name</th>
                <th className="p-3">Contact</th>
                <th className="p-3">Email</th>
                <th className="p-3">Syllabus</th>
                <th className="p-3">Joining Date</th>
                <th className="p-3">Zoom Link</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTeachers.map((r) => (
                <tr key={r.id} className="border-t hover:bg-gray-50 transition">
                  <td className="p-3">{r.roll_no}</td>
                  <td className="p-3">{r.name}</td>
                  <td className="p-3">{r.contact}</td>
                  <td className="p-3">{r.email}</td>
                  <td className="p-3">
                    {Array.isArray(r.syllabus) ? r.syllabus.join(', ') : r.syllabus || '—'}
                  </td>
                  <td className="p-3">{r.joining_date || '—'}</td>
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
                    <Button size="sm" variant="outline" onClick={() => editTeacher(r)}>
                      Edit
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => del(r.id)}>
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
              {filteredTeachers.length === 0 && (
                <tr>
                  <td colSpan={8} className="p-4 text-center text-gray-500">
                    No teachers found.
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
