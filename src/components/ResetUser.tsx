"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

export default function ResetUser() {
  const [showForms, setShowForms] = useState(false);
  const { toast } = useToast();

  const [studentEmail, setStudentEmail] = useState("");
  const [teacherEmail, setTeacherEmail] = useState("");
  const [adminEmail, setAdminEmail] = useState("");

  const [studentPassword, setStudentPassword] = useState("");
  const [teacherPassword, setTeacherPassword] = useState("");
  const [adminPassword, setAdminPassword] = useState("");

  const handleReset = async (email: string, password: string) => {
    if (!email || !password) {
      toast({
        title: "Missing Fields",
        description: "Please enter both email and password.",
      });
      return;
    }

    try {
      const res = await fetch("/api/update-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, newPassword: password }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast({ title: "Error", description: data.error || "Update failed" });
      } else {
        toast({
          title: "Success",
          description: `${email} updated successfully.`,
        });
      }
    } catch (err: any) {
      toast({ title: "Error", description: err.message });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Password / Email Reset</CardTitle>
      </CardHeader>
      <CardContent>
        {/* 🔘 Button to Toggle */}
        <Button className="mb-4" onClick={() => setShowForms(!showForms)}>
          {showForms ? "Hide Reset Forms" : "Show Reset Forms"}
        </Button>

        {showForms && (
          <div className="space-y-6">
            {/* Student Reset */}
            <div className="border p-4 rounded-md space-y-3">
              <h3 className="font-semibold">Student</h3>
              <input
                type="email"
                className="border p-2 rounded w-full"
                placeholder="Student Email"
                value={studentEmail}
                onChange={(e) => setStudentEmail(e.target.value)}
              />
              <input
                type="password"
                className="border p-2 rounded w-full"
                placeholder="New Password"
                value={studentPassword}
                onChange={(e) => setStudentPassword(e.target.value)}
              />
              <Button
                className="bg-green-600 hover:bg-green-700"
                onClick={() => handleReset(studentEmail, studentPassword)}
              >
                Update Student
              </Button>
            </div>

            {/* Teacher Reset */}
            <div className="border p-4 rounded-md space-y-3">
              <h3 className="font-semibold">Teacher</h3>
              <input
                type="email"
                className="border p-2 rounded w-full"
                placeholder="Teacher Email"
                value={teacherEmail}
                onChange={(e) => setTeacherEmail(e.target.value)}
              />
              <input
                type="password"
                className="border p-2 rounded w-full"
                placeholder="New Password"
                value={teacherPassword}
                onChange={(e) => setTeacherPassword(e.target.value)}
              />
              <Button
                className="bg-blue-600 hover:bg-blue-700"
                onClick={() => handleReset(teacherEmail, teacherPassword)}
              >
                Update Teacher
              </Button>
            </div>

            {/* Admin Reset */}
            <div className="border p-4 rounded-md space-y-3">
              <h3 className="font-semibold">Admin</h3>
              <input
                type="email"
                className="border p-2 rounded w-full"
                placeholder="Admin Email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
              />
              <input
                type="password"
                className="border p-2 rounded w-full"
                placeholder="New Password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
              />
              <Button
                className="bg-red-600 hover:bg-red-700"
                onClick={() => handleReset(adminEmail, adminPassword)}
              >
                Update Admin
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
