"use client";

import { useSearchParams } from "next/navigation";
import StudentSigninPage from "@/components/auth/StudentLogin";
import TeacherSigninPage from "@/components/auth/TeacherLogin";

export default function LoginPage() {
  const searchParams = useSearchParams();
  const role = searchParams.get("role");

  if (role === "teacher") {
    return <TeacherSigninPage />;
  }

  // default: show student login
  return <StudentSigninPage />;
}
