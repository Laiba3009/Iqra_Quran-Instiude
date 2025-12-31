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
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-slate-800 to-slate-900 p-4">
      <form
        onSubmit={handleLogin}
        className="bg-white dark:bg-slate-800 shadow-2xl rounded-2xl p-8 w-full max-w-md border border-slate-300 dark:border-slate-700"
      >
        {/* Back Button */}
        <div className="mb-4">
          <button
            type="button"
            onClick={() => window.history.back()}
            className="flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back
          </button>
        </div>

        <h1 className="text-3xl font-bold text-center text-slate-800 dark:text-white mb-6">
          Student Login
        </h1>

        <label className="block text-slate-700 dark:text-slate-200 font-medium mb-2">Email</label>
        <input
          type="email"
          placeholder="Enter Email (student@quran.com)"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="block w-full mb-5 p-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-700 placeholder-slate-500 dark:placeholder-slate-400"
          required
        />

        <label className="block text-slate-700 dark:text-slate-200 font-medium mb-2">Roll Number</label>
        <input
          type="text"
          placeholder="Enter your Roll Number"
          value={rollNo}
          onChange={(e) => setRollNo(e.target.value)}
          className="block w-full mb-5 p-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-700 placeholder-slate-500 dark:placeholder-slate-400"
          required
        />

        <label className="block text-slate-700 dark:text-slate-200 font-medium mb-2">Password</label>
        <input
          type="password"
          placeholder="Enter Password (student123)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="block w-full mb-5 p-3 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-700 placeholder-slate-500 dark:placeholder-slate-400"
          required
        />

        {errorMsg && (
          <p className="text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-2 rounded text-center mb-4">
            {errorMsg}
          </p>
        )}

        <Button
          type="submit"
          className="w-full bg-blue-700 hover:bg-blue-800 text-white py-3 rounded-lg text-lg font-semibold transition-all duration-300 shadow-md hover:shadow-lg"
        >
          Login
        </Button>

        <p className="text-center text-sm text-slate-600 dark:text-slate-300 mt-4">
          Default Email: <b className="text-slate-800 dark:text-slate-200">{FIXED_STUDENT_EMAIL}</b>
          <br />
          Default Password: <b className="text-slate-800 dark:text-slate-200">{FIXED_STUDENT_PASSWORD}</b>
        </p>
      </form>
    </div>
  );
}
