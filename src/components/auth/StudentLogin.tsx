"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";

export default function StudentSigninPage() {
  const [rollNo, setRollNo] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();

  const FIXED_STUDENT_EMAIL = "student@quran.com";
  const FIXED_STUDENT_PASSWORD = "student123";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    // Step 1: Check fixed credentials
    if (email !== FIXED_STUDENT_EMAIL || password !== FIXED_STUDENT_PASSWORD) {
      setErrorMsg("Invalid email or password.");
      return;
    }

    // Step 2: Verify roll number exists
    const { data: student, error } = await supabase
      .from("students")
      .select("id, name, roll_no, courses")
      .eq("roll_no", rollNo.trim())
      .maybeSingle();

    if (error) {
      console.error("Supabase error:", error);
      setErrorMsg("Database error. Please try again later.");
      return;
    }

    if (!student) {
      setErrorMsg("Roll number not found.");
      return;
    }

    // Step 3: Save cookies + localStorage for sidebar
    document.cookie = `student_roll=${rollNo}; path=/; max-age=86400;`;
    document.cookie = `portal_role=student; path=/; max-age=86400;`;
    localStorage.setItem("userRole", "student"); // ✅ Add this

    // Step 4: Redirect
    router.push("/student/dashboard");
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-green-50 to-green-100">
      <form
        onSubmit={handleLogin}
        className="bg-white shadow-2xl rounded-2xl p-8 w-full max-w-md border border-green-200"
      >
        <h1 className="text-3xl font-bold text-center text-green-700 mb-6">
          Student Login
        </h1>

        <label className="block text-gray-700 font-medium mb-2">Email</label>
        <input
          type="email"
          placeholder="Enter Email (student@quran.com)"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="block w-full mb-5 p-3 border-2 border-green-400 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-800 placeholder-gray-400"
          required
        />

        <label className="block text-gray-700 font-medium mb-2">Roll Number</label>
        <input
          type="text"
          placeholder="Enter your Roll Number"
          value={rollNo}
          onChange={(e) => setRollNo(e.target.value)}
          className="block w-full mb-5 p-3 border-2 border-green-400 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-800 placeholder-gray-400"
          required
        />

        <label className="block text-gray-700 font-medium mb-2">Password</label>
        <input
          type="password"
          placeholder="Enter Password (student123)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="block w-full mb-5 p-3 border-2 border-green-400 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-800 placeholder-gray-400"
          required
        />

        {errorMsg && (
          <p className="text-red-600 bg-red-50 border border-red-200 p-2 rounded text-center mb-4">
            {errorMsg}
          </p>
        )}

        <Button
          type="submit"
          className="w-full bg-green-700 hover:bg-green-800 text-white py-3 rounded-lg text-lg font-semibold"
        >
          Login
        </Button>

        <p className="text-center text-sm text-gray-500 mt-4">
          Default Email: <b>{FIXED_STUDENT_EMAIL}</b>
          <br />
          Default Password: <b>{FIXED_STUDENT_PASSWORD}</b>
        </p>
      </form>
    </div>
  );
}
