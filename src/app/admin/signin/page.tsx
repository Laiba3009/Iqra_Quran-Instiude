"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function AdminSigninPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);
if (error) {
  console.error("Supabase Error:", error);
  setErrorMsg(error.message || "Something went wrong, please try again.");
  return;
}


    // ✅ Store admin session locally
    document.cookie = `portal_role=admin; path=/; max-age=86400;`;
    localStorage.setItem("userRole", "admin");

    router.push("/admin/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md"
      >
        <h1 className="text-3xl font-bold text-center mb-6">Admin Login</h1>

        <input
          type="email"
          placeholder="Enter email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border p-3 rounded-lg mb-4"
          required
        />

        <input
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border p-3 rounded-lg mb-4"
          required
        />

        {errorMsg && (
          <p className="text-red-600 bg-red-50 p-2 rounded text-center mb-3">
            {errorMsg}
          </p>
        )}

        <Button
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </Button>

        {/* 🔹 Forgot Password Link */}
        <div className="text-center mt-4">
          <Link
            href="/admin/reset-password"
            className="text-blue-600 hover:underline"
          >
            Forgot your password?
          </Link>
        </div>
      </form>
    </div>
  );
}
