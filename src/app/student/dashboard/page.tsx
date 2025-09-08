'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import SyllabusHome from '../syllabus/student/syllabus/page';

export default function StudentDashboard(){
  const [zoomLink, setZoomLink] = useState('');
  const [reason, setReason] = useState('');

  useEffect(()=>{
    (async ()=>{
      const { data } = await supabase.from('settings').select('current_zoom_link').eq('id',1).maybeSingle();
      setZoomLink(data?.current_zoom_link || '');
    })();
  },[]);

  const join = () => {
    if(!zoomLink){ alert('Zoom link not set by admin.'); return; }
    window.open(zoomLink, '_blank');
  };

  const cancel = async () => {
    if(!reason.trim()){ alert('Please enter reason'); return; }
    // For demo: class_id nullable, you can pass specific class in real flow
    const { error } = await supabase.from('cancel_reasons').insert([{ class_id: null, student_id: 0, reason }]);
    if(error){ alert(error.message); return; }
    setReason('');
    alert('Reason sent to admin.');
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Student Dashboard</h1>
      <div className="flex gap-3">
        <Button onClick={join}>Join Class</Button>
        <div className="flex items-center gap-2">
          <input className="border p-2 rounded" placeholder="Cancel reason..." value={reason} onChange={e=>setReason(e.target.value)} />
          <Button className="bg-red-600 hover:bg-red-700" onClick={cancel}>Cancel & Send</Button>
        </div>
      </div>
      <p className="text-sm text-gray-600">Join uses latest Zoom link from Admin settings.</p>
      <SyllabusHome />
    </div>
  )
}
