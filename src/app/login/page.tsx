'use client';

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import StudentSigninPage from "@/components/auth/StudentLogin";
import TeacherSigninPage from "@/components/auth/TeacherLogin";

// 👇 Ye inner component actual logic rakhta hai
function LoginPageContent() {
  const searchParams = useSearchParams();
  const role = searchParams.get("role");

  if (role === "teacher") return <TeacherSigninPage />;
  return <StudentSigninPage />;
}

// 👇 Ye outer component Suspense boundary provide karta hai
export default function LoginPage() {
  return (
    <Suspense fallback={<div className="text-white text-center p-10">Loading...</div>}>
      <LoginPageContent />
    </Suspense>
  );
}
