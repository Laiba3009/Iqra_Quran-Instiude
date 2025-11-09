'use client';
 
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";
import BannerSlider from "@/components/BannerSlider";

// 🔹 Notice Board (Read-only)
function NoticeComponent({ userRole }: { userRole: "student" | "teacher" }) {
  const [notices, setNotices] = useState<any[]>([]);

  useEffect(() => {
    loadNotices();
  }, []);

  const loadNotices = async () => {
    const { data, error } = await supabase
      .from("notices")
      .select("*")
      .contains("visible_to", [userRole])
      .eq("deleted", false) // ✅ only show active notices
      .order("created_at", { ascending: false });

    if (data) setNotices(data);
  };

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 shadow mt-4">
      <h2 className="text-lg font-bold text-yellow-800 mb-2">📢 Notice Board</h2>
      {notices.length === 0 ? (
        <p className="text-gray-500">No new notices yet.</p>
      ) : (
        <ul className="space-y-3">
          {notices.map((n) => (
            <li key={n.id} className="bg-white shadow-sm border p-3 rounded">
              <h3 className="font-semibold text-green-700">{n.title}</h3>
              <p className="text-gray-700">{n.message}</p>
              <span className="text-xs text-gray-400">
                {new Date(n.created_at).toLocaleString()}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

type Student = {
  id: number;
  name: string;
  roll_no: string;
  email?: string;
  teachers?: string[];
};

type Teacher = {
  id: number;
  name: string;
  email?: string;
  zoom_link?: string;
};

function getCookie(name: string) {
  return document.cookie.split("; ").reduce((r, v) => {
    const parts = v.split("=");
    return parts[0].trim() === name ? decodeURIComponent(parts[1]) : r;
  }, "");
}

export default function StudentDashboard() {
  const [student, setStudent] = useState<Student | null>(null);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [reason, setReason] = useState("");
  const [complaint, setComplaint] = useState("");
  const [feeStatus, setFeeStatus] = useState<string | null>(null);
  const { toast } = useToast();

  // 🧩 Load student data
  useEffect(() => {
    const fetchData = async () => {
      const roll = getCookie("student_roll");
      if (!roll) return;

      const { data: studentData, error: studentErr } = await supabase
        .from("students")
        .select("*")
        .eq("roll_no", roll)
        .maybeSingle();

      if (studentErr || !studentData) return setStudent(null);
      setStudent(studentData);

      // Fetch teachers
      if (studentData.teachers?.length > 0) {
        const { data: teacherData } = await supabase
          .from("teachers")
          .select("id, name, email, zoom_link")
          .in("email", studentData.teachers);
        if (teacherData) setTeachers(teacherData);
      }

      // Fee status
      const month = new Date().toISOString().slice(0, 7);
      const { data: feeData } = await supabase
        .from("student_fees")
        .select("status")
        .eq("student_id", studentData.id)
        .eq("month", month)
        .maybeSingle();
      if (feeData) setFeeStatus(feeData.status);
    };

    fetchData();
  }, []);

  // 🧾 Upload Fee Proof
  const handleUploadProof = async () => {
    if (!student) return;
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*";

    fileInput.onchange = async (e: any) => {
      const file = e.target.files[0];
      if (!file) return;

      const fileName = `${student.roll_no}-${Date.now()}.jpg`;
      const { error: uploadError } = await supabase.storage
        .from("fee_proofs")
        .upload(fileName, file);

      if (uploadError)
        return toast({ title: "Upload Error", description: uploadError.message });

      const { data: publicUrlData } = supabase.storage
        .from("fee_proofs")
        .getPublicUrl(fileName);

      const proofUrl = publicUrlData?.publicUrl;
      const month = new Date().toISOString().slice(0, 7);

      const { error: dbError } = await supabase.from("student_fees").upsert(
        {
          student_id: student.id,
          month,
          proof_url: proofUrl,
          status: "pending",
        },
        { onConflict: "student_id, month" }
      );

      if (dbError)
        return toast({ title: "Database Error", description: dbError.message });

      setFeeStatus("pending");
      toast({ title: "Fee Proof Uploaded", description: "Waiting for admin approval." });
    };

    fileInput.click();
  };

  // 🧑‍🏫 Join Class
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

    if (error) return toast({ title: "Error", description: error.message });
    toast({
      title: "Attendance Marked ✅",
      description: `Joining ${teacher.name}'s class...`,
    });

    if (teacher.zoom_link) window.open(teacher.zoom_link, "_blank");
    else toast({ title: "Zoom Link Missing", description: "This teacher has not added a Zoom link yet." });
  };

  // ❌ Cancel Request
  const cancel = async () => {
    if (!reason.trim())
      return toast({
        title: "Missing Reason",
        description: "Enter a reason first.",
      });
    const { error } = await supabase
      .from("cancel_reasons")
      .insert([{ student_roll: student?.roll_no, reason }]);
    if (error) return toast({ title: "Error", description: error.message });
    setReason("");
    toast({
      title: "Cancel Sent",
      description: "Your class cancel request was sent to admin.",
    });
  };

  // 😠 Complaint
  const sendComplaint = async () => {
    if (!complaint.trim())
      return toast({
        title: "Missing Complaint",
        description: "Please write your complaint before sending.",
      });
    const { error } = await supabase
      .from("complaints")
      .insert([{ student_roll: student?.roll_no, complaint }]);
    if (error) return toast({ title: "Error", description: error.message });
    setComplaint("");
    toast({
      title: "Complaint Sent",
      description: "Your complaint was delivered to admin.",
    });
  };

  // 🧩 UI
  if (!student)
    return <div className="p-8 text-center text-gray-700 font-medium">Loading student info...</div>;

  return (
    <div className="space-y-8 mt-8 px-4 md:px-12">
      <BannerSlider />

      <h1 className="text-3xl md:text-4xl font-bold text-center text-green-800">
        Welcome, {student.name} (Roll No: {student.roll_no})
      </h1>

      {/* Upload Fee Proof */}
      <div className="flex justify-end mt-4 md:mt-6 px-4 md:px-0">
        {feeStatus === "approved" && (
          <Button disabled className="bg-green-600 hover:bg-green-700 text-white cursor-default">
            ✅ Fee Paid
          </Button>
        )}

        {feeStatus === "pending" && (
          <Button disabled className="bg-yellow-500 hover:bg-yellow-600 text-white cursor-default">
            ⏳ Waiting for Approval
          </Button>
        )}

        {(!feeStatus || feeStatus === "rejected") && (
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={handleUploadProof}
          >
            📤 Upload Fee Proof
          </Button>
        )}
      </div>

      {/* 📢 Notice Board */}
      <NoticeComponent userRole="student" />

      {/* Classes */}
      <Card className="shadow-xl border border-gray-200 bg-white">
        <h1 className="text-3xl font-bold text-center text-green-800 mb-6">
          Student Classes
        </h1>
        <CardContent>
          {teachers.length === 0 ? (
            <p className="text-gray-600">No teachers assigned yet.</p>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {teachers.map((teacher) => (
                <div
                  key={teacher.id}
                  className="p-4 rounded-lg border hover:shadow-md transition bg-gray-50"
                >
                  <h3 className="font-semibold text-green-700 text-lg">
                    👨‍🏫 {teacher.name}
                  </h3>
                  <Button
                    className="mt-3 w-full bg-blue-600 hover:bg-blue-700"
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

      {/* Cancel Request */}
      <Card className="shadow-xl border border-gray-200 bg-white">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-800">
            Cancel Request
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-3">
            <Textarea
              className="border p-2 rounded-md w-full md:w-2/3"
              placeholder="Enter reason for cancellation..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
            <Button
              className="bg-red-600 hover:bg-red-700 w-full md:w-auto"
              onClick={cancel}
            >
              Send
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Complaint */}
      <Card className="shadow-xl border border-gray-200 bg-white">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-800">
            Teacher Complaint
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-3">
            <Textarea
              className="border p-2 rounded-md w-full md:w-2/3"
              placeholder="Write your complaint..."
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

      {/* Syllabus */}
      <Card className="shadow-xl border border-gray-200 bg-white">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-800">
            My Syllabus
          </CardTitle>
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
              <Link key={s.slug} href={`/student/syllabus/student/syllabus/${s.slug}`}>
                <div className="p-4 border rounded-lg bg-gray-50 hover:bg-gray-100 cursor-pointer transition">
                  <h3 className="font-semibold text-green-700 text-lg">
                    📘 {s.title}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
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
