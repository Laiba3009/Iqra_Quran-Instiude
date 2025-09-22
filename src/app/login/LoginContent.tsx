'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { routeByRole } from '@/utils/auth';
import { Button } from '@/components/ui/button';

export default function LoginContent() {
  const router = useRouter();
  const sp = useSearchParams();
  const defaultRole = sp?.get('role') ?? 'student';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState(defaultRole);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const onLogin = async () => {
    setLoading(true);
    setErrorMessage('');

    // Supabase Auth Login
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    // ✅ Save role in localStorage for Navbar use
    localStorage.setItem("userRole", role);

    // ✅ Redirect based on role
    router.push(routeByRole(role));
  };

  return (
    <form
      onSubmit={e => { e.preventDefault(); onLogin(); }}
      className="max-w-md mx-auto mt-20 p-6 bg-white rounded-lg shadow space-y-4"
    >
      <h1 className="text-3xl font-bold text-center text-green-800">Login</h1>

      {errorMessage && <p className="text-red-600 text-center">{errorMessage}</p>}

      <input
        type="email"
        className="border p-2 w-full rounded"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        required
      />

      <input
        type="password"
        className="border p-2 w-full rounded"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        required
      />

      <select
        className="border p-2 w-full rounded"
        value={role}
        onChange={e => setRole(e.target.value)}
      >
        <option value="admin">Admin</option>
        <option value="teacher">Teacher</option>
        <option value="student">Student</option>
      </select>

      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? 'Logging in...' : 'Login'}
      </Button>
    </form>
  );
}
