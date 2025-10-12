'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';

export default function TeacherDashboard() {
  const [teacher, setTeacher] = useState<any>(null);
  const [zoomLink, setZoomLink] = useState('');

  useEffect(() => {
    const cookies = document.cookie.split('; ').reduce((acc, c) => {
      const [key, val] = c.split('=');
      acc[key] = val;
      return acc;
    }, {} as Record<string, string>);

    const roll = cookies['teacher_roll'];
    if (roll) loadTeacher(roll);
  }, []);

  const loadTeacher = async (rollNo: string) => {
    const { data } = await supabase.from('teachers').select('*').eq('roll_no', rollNo).maybeSingle();
    setTeacher(data);

    const { data: settings } = await supabase.from('settings').select('current_zoom_link').eq('id', 1).maybeSingle();
    setZoomLink(settings?.current_zoom_link || '');
  };

  const sendReminder = async () => {
    alert('Reminder stub: configure WhatsApp Cloud API in /api/whatsapp/send.');
  };

  if (!teacher) return <p>Loading teacher data...</p>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-green-800">Welcome, {teacher.name}</h1>

      <div className="bg-white shadow-lg rounded-2xl p-6 space-y-4">
        <h2 className="text-xl font-semibold text-gray-700">Your Courses</h2>
        <ul className="list-disc pl-6">
          {teacher.courses?.map((c: string, i: number) => (
            <li key={i}>{c}</li>
          ))}
        </ul>

        <div className="flex gap-3 mt-4">
          <a href={zoomLink || '#'} target="_blank" className="px-4 py-2 rounded bg-blue-600 text-white">
            Join Class
          </a>
          <Button onClick={sendReminder} className="bg-emerald-600 hover:bg-emerald-700">
            Send Reminder (once)
          </Button>
        </div>

        <p className="text-sm text-gray-500 mt-2">
          Zoom link is pulled from Settings (Admin controlled).
        </p>
      </div>
    </div>
  );
}
