'use client';

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";

// ----------------------------
// 🔹 Type Definitions
// ----------------------------
type Student = {
  id: number;
  name: string;
  roll_no: string;
  email?: string;
  teachers?: string[]; // teacher emails assigned to this student
};

type Teacher = {
  id: number;
  name: string;
  email?: string;
  zoom_link?: string;
};

// ----------------------------
// 🔹 Helper: Read cookie
// ----------------------------
function getCookie(name: string) {
  return document.cookie.split("; ").reduce((r, v) => {
    const parts = v.split("=");
    return parts[0].trim() === name ? decodeURIComponent(parts[1]) : r;
  }, "");
}

// ----------------------------
// 🔹 Main Component
// ----------------------------
export default function StudentDashboard() {
  const [student, setStudent] = useState<Student | null>(null);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [reason, setReason] = useState("");
  const [complaint, setComplaint] = useState("");
  const { toast } = useToast();

  // ----------------------------
  // 🔹 Fetch Student & Teachers
  // ----------------------------
  useEffect(() => {
    const fetchData = async () => {
      const roll = getCookie("student_roll");
      if (!roll) return;

      // ✅ Load Student
      const { data: studentData, error: studentErr } = await supabase
        .from("students")
        .select("*")
        .eq("roll_no", roll)
        .maybeSingle();

      if (studentErr || !studentData) {
        console.error("Error fetching student:", studentErr);
        return;
      }
      setStudent(studentData);

      // ✅ Load Assigned Teachers
      if (studentData.teachers?.length > 0) {
        const { data: teacherData } = await supabase
          .from("teachers")
          .select("id, name, email, zoom_link")
          .in("email", studentData.teachers);

        if (teacherData) setTeachers(teacherData);
      }
    };

    fetchData();
  }, []);

  // ----------------------------
  // 🔹 Join Class
  // ----------------------------
  const handleJoinClass = async (teacher: Teacher) => {
    if (!student) return;

    const { error } = await supabase.from("attendance").insert([
      {
        student_name: student.name,
        student_roll: student.roll_no,
        teacher_name: teacher.name,
        joined_at: new Date().toISOString(),
      },
    ]);

    if (error) {
      toast({ title: "Error", description: error.message });
      return;
    }

    toast({
      title: "Attendance Marked ✅",
      description: `Joining ${teacher.name}'s class...`,
    });

    if (teacher.zoom_link) {
      window.open(teacher.zoom_link, "_blank");
    } else {
      toast({
        title: "Zoom Link Missing",
        description: "This teacher has not added a Zoom link yet.",
      });
    }
  };

  // ----------------------------
  // 🔹 Cancel Request
  // ----------------------------
  const cancel = async () => {
    if (!reason.trim()) {
      toast({ title: "Missing Reason", description: "Enter a reason first." });
      return;
    }

    const { error } = await supabase
      .from("cancel_reasons")
      .insert([{ student_roll: student?.roll_no, reason }]);

    if (error) {
      toast({ title: "Error", description: error.message });
      return;
    }

    setReason("");
    toast({
      title: "Cancel Sent",
      description: "Your class cancel request was sent to admin.",
    });
  };

  // ----------------------------
  // 🔹 Complaint
  // ----------------------------
  const sendComplaint = async () => {
    if (!complaint.trim()) {
      toast({
        title: "Missing Complaint",
        description: "Please write your complaint before sending.",
      });
      return;
    }

    const { error } = await supabase.from("complaints").insert([
      {
        student_roll: student?.roll_no,
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

  // ----------------------------
  // 🔹 Loading State
  // ----------------------------
  if (!student) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-semibold">Loading student info...</h2>
      </div>
    );
  }

  // ----------------------------
  // 🔹 UI Layout
  // ----------------------------
  return (
    <div className="space-y-6 mt-8 p-4 md:p-8">
      <h1 className="text-3xl font-bold text-green-800">
        Welcome, {student.name} (Roll No: {student.roll_no})
      </h1>

      {/* ✅ Join Class */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Join Class</CardTitle>
        </CardHeader>
        <CardContent>
          {teachers.length === 0 ? (
            <p>No teachers assigned yet.</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {teachers.map((teacher) => (
                <div
                  key={teacher.id}
                  className="border rounded-lg p-3 bg-gray-50 hover:bg-gray-100 transition"
                >
                  <h3 className="font-semibold text-green-700">
                    👨‍🏫 {teacher.name}
                  </h3>
                  <Button
                    className="mt-2 w-full bg-blue-600 hover:bg-blue-700"
                    onClick={() => handleJoinClass(teacher)}
                  >
                    Join Class
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ✅ Cancel Request */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Cancel Request</CardTitle>
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

      {/* ✅ Complaint */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Teacher Complaint</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-2">
            <input
              className="border p-2 rounded flex-1"
              placeholder="Write complaint..."
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

      {/* ✅ My Syllabus (Static) */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>My Syllabus</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { title: "Hadith Course", slug: "hadith" },
              { title: "Islamic Studies", slug: "islamic-studies" },
              { title: "Quran", slug: "quran" },
              { title: "English", slug: "english" },
              { title: "Urdu", slug: "urdu" },
            ].map((s) => (
              <Link
                key={s.slug}
                href={`/student/syllabus/student/syllabus/${s.slug}`}
              >
                <div className="border rounded-lg p-3 bg-gray-50 hover:bg-gray-100 transition cursor-pointer">
                  <h3 className="font-semibold text-green-700">📘 {s.title}</h3>
                  <p className="text-sm text-gray-600">
                    Click to view {s.title} syllabus.
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
