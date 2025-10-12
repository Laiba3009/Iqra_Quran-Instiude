// src/components/auth/ForgotPassword.tsx
"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const sendReset = async () => {
    if (!email) return alert("Email daalain.");
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${location.origin}/reset-password`
    });
    setLoading(false);
    if (error) return alert(error.message);
    alert("Password reset email bhej diya gaya. Inbox check karein.");
  };

  return (
    <div className="max-w-md mx-auto p-6 space-y-4">
      <h2 className="text-xl font-bold">Forgot Password</h2>
      <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Your email" className="border p-2 w-full rounded" />
      <div>
        <button onClick={sendReset} className="bg-orange-600 text-white px-4 py-2 rounded" disabled={loading}>{loading ? "Sending..." : "Send reset email"}</button>
      </div>
    </div>
  );
}
