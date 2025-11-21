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
    if (email.trim() !== FIXED_TEACHER_EMAIL || password.trim() !== FIXED_TEACHER_PASSWORD) {
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

    // Step 3: Save cookies + localStorage for sidebar
    document.cookie = `portal_role=teacher; path=/; max-age=86400;`;
    document.cookie = `teacher_roll=${rollNo}; path=/; max-age=86400;`;
    localStorage.setItem("userRole", "teacher"); // ✅ Add this

    
// ✅ Add this line to save roll number
localStorage.setItem("teacher_roll_no", rollNo); 
localStorage.setItem("userRole", "teacher");
    // Step 4: Redirect
    router.push("/teacher/dashboard");
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-blue-50 to-blue-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md border border-blue-200"
      >
        <h1 className="text-3xl font-bold text-center text-blue-700 mb-6">
          Teacher Login
        </h1>

        <label className="block text-gray-700 mb-2 font-medium">Email</label>
        <input
          type="email"
          value={email}
          placeholder="Enter your email"
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 mb-4 border-2 border-blue-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />

        <label className="block text-gray-700 mb-2 font-medium">Password</label>
        <input
          type="password"
          value={password}
          placeholder="Enter your password"
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 mb-4 border-2 border-blue-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />

        <label className="block text-gray-700 mb-2 font-medium">Roll Number</label>
        <input
          type="text"
          value={rollNo}
          placeholder="Enter your Roll No"
          onChange={(e) => setRollNo(e.target.value)}
          className="w-full p-3 mb-4 border-2 border-blue-400 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />

        {errorMsg && (
          <p className="text-red-600 text-center mb-3">{errorMsg}</p>
        )}

        <Button
          type="submit"
          className="w-full bg-blue-700 hover:bg-blue-800 text-white font-semibold py-3 rounded-lg"
        >
          Login
        </Button>

        <p className="text-sm text-center text-gray-500 mt-3">
          Default Email: <b>{FIXED_TEACHER_EMAIL}</b> <br />
          Default Password: <b>{FIXED_TEACHER_PASSWORD}</b>
        </p>
      </form>
    </div>
  );
}
