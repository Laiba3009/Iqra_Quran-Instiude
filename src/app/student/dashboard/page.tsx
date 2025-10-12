"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

type Student = {
  id: number;
  name: string;
  roll_no: string;
  email?: string;
  courses?: string[];
};

type SyllabusItem = {
  id: number;
  course_name: string;
  title?: string;
  syllabus_items?: string[] | string;
};

// cookie se student roll number lena
function getCookie(name: string) {
  return document.cookie.split("; ").reduce((r, v) => {
    const parts = v.split("=");
    return parts[0].trim() === name ? decodeURIComponent(parts[1]) : r;
  }, "");
}

export default function StudentDashboard() {
  const [student, setStudent] = useState<Student | null>(null);
  const [reason, setReason] = useState("");
  const [complaint, setComplaint] = useState("");
  const [syllabus, setSyllabus] = useState<SyllabusItem[]>([]);
  const { toast } = useToast();

  // 🔹 Fetch logged-in student by roll_no cookie
  useEffect(() => {
    const fetchStudent = async () => {
      const roll = getCookie("student_roll");
      if (!roll) return;

      const { data, error } = await supabase
        .from("students")
        .select("id, name, email, roll_no, courses")
        .eq("roll_no", roll)
        .maybeSingle();

      if (error || !data) {
        console.error("Error fetching student:", error);
        return;
      }
      setStudent(data);

      // Fetch syllabus only for student's selected courses
      if (data.courses && data.courses.length > 0) {
        const { data: syllabusRows, error: sErr } = await supabase
          .from("syllabus")
          .select("*")
          .in("course_name", data.courses);

        if (!sErr && syllabusRows) setSyllabus(syllabusRows);
      }
    };

    fetchStudent();
  }, []);

  // 🔹 Cancel class request
  const cancel = async () => {
    if (!reason.trim()) {
      toast({
        title: "Missing Reason",
        description: "Please enter reason before sending.",
      });
      return;
    }
    const { error } = await supabase
      .from("cancel_reasons")
      .insert([{ student_roll: student?.roll_no || null, reason }]);
    if (error) {
      toast({ title: "Error", description: error.message });
      return;
    }
    setReason("");
    toast({
      title: "Cancel Sent",
      description: "Your class cancel reason was sent to admin.",
    });
  };

  // 🔹 Complaint system
  const sendComplaint = async () => {
    if (!complaint.trim()) {
      toast({
        title: "Missing Complaint",
        description: "Please write your complaint before sending.",
      });
      return;
    }
    const { error } = await supabase
      .from("complaints")
      .insert([
        {
          student_roll: student?.roll_no || null,
          teacher_name: null,
          complaint,
        },
      ]);
    if (error) {
      toast({ title: "Error", description: error.message });
      return;
    }
    setComplaint("");
    toast({
      title: "Complaint Sent",
      description: "Your complaint was delivered to admin.",
    });
  };

  if (!student) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-semibold">Loading student info...</h2>
      </div>
    );
  }

  return (
    <div className="space-y-6 mt-8 p-4 md:p-8">
      {/* Header */}
      <h1 className="text-3xl font-bold text-green-800">
        Welcome, {student.name} (Roll No: {student.roll_no})
      </h1>
      <p className="text-gray-600">
        Courses: {(student.courses || []).join(", ") || "No courses assigned"}
      </p>

      {/* 🔸 Cancel Request Section */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Cancel Request
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 mt-2">
            <input
              className="border p-2 rounded flex-1"
              placeholder="Enter reason for cancellation..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
            <Button className="bg-red-600 hover:bg-red-700" onClick={cancel}>
              Send
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 🔸 Complaint Section */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            Teacher Complaint
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-2">
            <input
              className="border p-2 rounded flex-1"
              placeholder="Write complaint about teacher..."
              value={complaint}
              onChange={(e) => setComplaint(e.target.value)}
            />
            <Button
              className="bg-yellow-600 hover:bg-yellow-700 w-full md:w-auto"
              onClick={sendComplaint}
            >
              Send Complaint
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 🔸 Syllabus Section */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">My Syllabus</CardTitle>
        </CardHeader>
        <CardContent>
          {syllabus.length === 0 ? (
            <p>No syllabus assigned yet.</p>
          ) : (
            <div className="space-y-3">
              {syllabus.map((s) => (
                <div
                  key={s.id}
                  className="border rounded-lg p-3 bg-gray-50 hover:bg-gray-100 transition"
                >
                  <h3 className="font-semibold text-green-700">
                    📘 {s.course_name} {s.title ? `- ${s.title}` : ""}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {Array.isArray(s.syllabus_items)
                      ? s.syllabus_items.join(", ")
                      : s.syllabus_items}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
