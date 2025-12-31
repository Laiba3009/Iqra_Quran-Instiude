"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";

// Fixed credentials
const FIXED_TEACHER_EMAIL =
  process.env.NEXT_PUBLIC_FIXED_TEACHER_EMAIL || "teacher@quran.com";
const FIXED_TEACHER_PASSWORD =
  process.env.NEXT_PUBLIC_FIXED_TEACHER_PASSWORD || "teacher123";

export default function TeacherSigninPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rollNo, setRollNo] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    // Step 1: Check fixed credentials
    if (
      email.trim() !== FIXED_TEACHER_EMAIL ||
      password.trim() !== FIXED_TEACHER_PASSWORD
    ) {
      setErrorMsg("Invalid email or password");
      return;
    }

    // Step 2: Verify roll number exists
    const { data: teacher, error } = await supabase
      .from("teachers")
      .select("*")
      .eq("roll_no", rollNo.trim())
      .maybeSingle();

    if (error) {
      console.error(error);
      setErrorMsg("Database error. Please try again later.");
      return;
    }

    if (!teacher) {
      setErrorMsg("No teacher found with this roll number.");
      return;
    }

    // ------------------------------
    //   ✅ STEP 3 — SAVE IDs
    // ------------------------------
    document.cookie = `portal_role=teacher; path=/; max-age=86400;`;
    document.cookie = `teacher_roll=${rollNo}; path=/; max-age=86400;`;

    // Save Role
    localStorage.setItem("userRole", "teacher");

    // 🟢 SAVE TEACHER UUID (MOST IMPORTANT)
    localStorage.setItem("teacher_id", teacher.id);
    document.cookie = `teacher_id=${teacher.id}; path=/; max-age=86400;`;

    // Save Roll No
    localStorage.setItem("teacher_roll_no", rollNo);

    // Step 4: Redirect
    router.push("/teacher/dashboard");
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-slate-800 to-slate-900 p-4">
      <form
        onSubmit={handleSubmit}
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
          Teacher Login
        </h1>

        <label className="block text-slate-700 dark:text-slate-200 mb-2 font-medium">Email</label>
        <input
          type="email"
          value={email}
          placeholder="Enter your email"
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 mb-4 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-700 placeholder-slate-500 dark:placeholder-slate-400"
        />

        <label className="block text-slate-700 dark:text-slate-200 mb-2 font-medium">Password</label>
        <input
          type="password"
          value={password}
          placeholder="Enter your password"
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 mb-4 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-700 placeholder-slate-500 dark:placeholder-slate-400"
        />

        <label className="block text-slate-700 dark:text-slate-200 mb-2 font-medium">
          Roll Number
        </label>
        <input
          type="text"
          value={rollNo}
          placeholder="Enter your Roll No"
          onChange={(e) => setRollNo(e.target.value)}
          className="w-full p-3 mb-4 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-700 placeholder-slate-500 dark:placeholder-slate-400"
        />

        {errorMsg && (
          <p className="text-red-600 dark:text-red-400 text-center mb-3">{errorMsg}</p>
        )}

        <Button
          type="submit"
          className="w-full bg-blue-700 hover:bg-blue-800 text-white font-semibold py-3 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg"
        >
          Login
        </Button>

        <p className="text-sm text-center text-slate-600 dark:text-slate-300 mt-3">
          Default Email: <b className="text-slate-800 dark:text-slate-200">{FIXED_TEACHER_EMAIL}</b> <br />
          Default Password: <b className="text-slate-800 dark:text-slate-200">{FIXED_TEACHER_PASSWORD}</b>
        </p>
      </form>
    </div>
  );
}
