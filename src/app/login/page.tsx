'use client';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { routeByRole } from '@/utils/auth';
import { Button } from '@/components/ui/button';

export default function LoginPage(){
  const router = useRouter();
  const sp = useSearchParams();
  const defaultRole = sp.get('role') ?? 'student';
  const [email,setEmail] = useState('');
  const [password,setPassword] = useState('');
  const [role,setRole] = useState(defaultRole);

  const onLogin = async () => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if(error){ alert(error.message); return; }
    // For demo, we route by selected role.
    router.push(routeByRole(role));
  }

  return (
    <div className="max-w-md mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Login</h1>
      <input className="border p-2 w-full rounded" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
      <input type="password" className="border p-2 w-full rounded" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} />
      <select className="border p-2 w-full rounded" value={role} onChange={e=>setRole(e.target.value)}>
        <option value="admin">Admin</option>
        <option value="teacher">Teacher</option>
        <option value="student">Student</option>
      </select>
      <Button onClick={onLogin}>Login</Button>
    </div>
  )
}
