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


    router.push("/admin/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded-xl shadow-md w-full max-w-md border border-gray-300"
      >

        <h1 className="text-3xl font-bold text-center text-gray-800 mb-8">Admin Login</h1>

        <input
          type="email"
          placeholder="Enter email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-gray-300 bg-white text-gray-900 p-3 rounded-lg mb-4 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required
        />

        <input
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border border-gray-300 bg-white text-gray-900 p-3 rounded-lg mb-4 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          required
        />

        {errorMsg && (
          <p className="text-red-600 bg-red-100 p-3 rounded-lg text-center mb-4 border border-red-300">
            {errorMsg}
          </p>
        )}

        <Button
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg"
          disabled={loading}
        >
          {loading ? "Logging in..." : "Login"}
        </Button>

        {/* 🔹 Forgot Password Link */}
        <div className="text-center mt-6">
          <Link
            href="/admin/reset-password"
            className="text-blue-600 hover:text-blue-800 hover:underline"
          >
            Forgot your password?
          </Link>
        </div>
      </form>
    </div>
  );
}