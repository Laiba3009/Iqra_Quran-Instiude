'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import BackButton from '@/components/ui/BackButton';

export default function ZoomLinkPage(){
  const [link, setLink] = useState('');
  const SETTINGS_ID = 1;

  const load = async () => {
    const { data } = await supabase.from('settings').select('current_zoom_link').eq('id', SETTINGS_ID).maybeSingle();
    setLink(data?.current_zoom_link || '');
  };

  useEffect(()=>{ load(); },[]);

  const save = async () => {
    const { error } = await supabase.from('settings').upsert({ id: SETTINGS_ID, current_zoom_link: link }).select();
    if(error){ alert(error.message); return; }
    alert('Zoom link updated');
  };

  return (
    <div className="space-y-4 max-w-xl">
      
            <BackButton href="/admin/dashboard" label="Back to Dashboard" />
      
      <h1 className="text-2xl font-bold">Update Zoom Link</h1>
      <input className="border p-2 w-full rounded" placeholder="https://zoom.us/j/..." value={link} onChange={e=>setLink(e.target.value)} />
      <Button onClick={save} className="bg-purple-600 hover:bg-purple-700">Save Link</Button>
      <p className="text-sm text-gray-600">Students/Teachers ke Join buttons yahi latest link use karenge.</p>
    </div>
  )
}
