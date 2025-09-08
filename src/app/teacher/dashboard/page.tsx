'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';

export default function TeacherDashboard(){
  const [zoomLink, setZoomLink] = useState('');

  useEffect(()=>{
    (async ()=>{
      const { data } = await supabase.from('settings').select('current_zoom_link').eq('id',1).maybeSingle();
      setZoomLink(data?.current_zoom_link || '');
    })();
  },[]);

  const sendReminder = async () => {
    alert('Reminder stub: configure WhatsApp Cloud API in /api/whatsapp/send.');
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Teacher Dashboard</h1>
      <div className="flex gap-3">
        <a href={zoomLink || '#'} target="_blank" className="px-4 py-2 rounded bg-blue-600 text-white">Join Class</a>
        <Button onClick={sendReminder} className="bg-emerald-600 hover:bg-emerald-700">Send Reminder (once)</Button>
      </div>
      <p className="text-sm text-gray-600">Zoom link is pulled from Settings. Update from Admin & it reflects here.</p>
    </div>
  )
}
