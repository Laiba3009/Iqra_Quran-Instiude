"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import BannerSlider from "@/components/BannerSlider";
import RoleBasedLayout from "@/components/RoleBasedLayout";
import TodayClassesCard from "@/components/TodayClassesCard";

// 🔹 Notice Board
function NoticeComponent({ userRole }: { userRole: "student" | "teacher" }) {
  const [notices, setNotices] = useState<any[]>([]);

  useEffect(() => {
    const loadNotices = async () => {
      const { data } = await supabase
        .from("notices")
        .select("*")
        .contains("visible_to", [userRole])
        .eq("deleted", false)
        .order("created_at", { ascending: false });
      if (data) setNotices(data);
    };
    loadNotices();
  }, []);

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

// 🔹 Cookie helper
const getCookie = (name: string) => {
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? match[2] : null;
};

// 🔹 Timezone helper
const tzOffsets: Record<string, number> = {
  "Pakistan (PKT)": 5,
  "Turkey (TRT)": 3,
  "United Kingdom (GMT)": 0,
  "USA - New York (EST)": -5,
  "China (CST)": 8,
  "Japan (JST)": 9,
  "Australia (AEST)": 10,
  "India (IST)": 5.5,
  "Singapore (SGT)": 8,
  "New Zealand (NZST)": 12,
  "Germany (CET)": 1,
  "Belgium (CET)": 1,
  "Gulf (UAE/Oman)": 4,
};

const formatTimeByOffset = (utcTime: string, tzOffset: number) => {
  if (!utcTime) return "TBD";
  const [hh, mm] = utcTime.split(":").map(Number);
  let local = hh + tzOffset;
  if (local >= 24) local -= 24;
  if (local < 0) local += 24;
  const period = local >= 12 ? "PM" : "AM";
  const h12 = local % 12 || 12;
  return `${h12}:${String(mm).padStart(2, "0")} ${period}`;
};

// 🔹 Main Dashboard
export default function StudentDashboard() {
  const { toast } = useToast();
  const [student, setStudent] = useState<any>(null);
  const [todaysClasses, setTodaysClasses] = useState<any[]>([]);
  const [feeStatus, setFeeStatus] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [complaint, setComplaint] = useState("");
  const [suggestion, setSuggestion] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const roll = getCookie("student_roll");
      if (!roll) return;

      // ✅ Fetch student
      const { data: studentData } = await supabase
        .from("students")
        .select("id, name, roll_no, class_days, timezone")
        .eq("roll_no", roll)
        .maybeSingle();
      if (!studentData) return;

      setStudent(studentData);

      // ✅ Fee status
      const month = new Date().toISOString().slice(0, 7);
      const { data: feeData } = await supabase
        .from("student_fees")
        .select("status")
        .eq("student_id", studentData.id)
        .eq("month", month)
        .maybeSingle();
      if (feeData) setFeeStatus(feeData.status);

      // 🔹 Fetch all teachers
      const { data: teachers } = await supabase
        .from("teachers")
        .select("id, name, email, zoom_link");

      // 🔹 Determine today's day in student timezone
      const tzOffset = tzOffsets[studentData.timezone] || 5; // default PKT
      const todayDate = new Date();
      const utcDayIndex = todayDate.getUTCDay();
      const localHour = todayDate.getUTCHours() + tzOffset;
      const adjustedDate = new Date(todayDate);
      adjustedDate.setUTCHours(localHour);
      const today = adjustedDate.toLocaleString("en-US", { weekday: "long" }).toLowerCase();

      // 🔹 Filter today’s classes
      const todayCls = (studentData.class_days || [])
        .filter((cls: any) => cls.day.toLowerCase() === today)
        .map((cls: any, idx: number) => {
          const teacher = teachers?.find(
            (t) => t.id === cls.teacher_id || t.email === cls.teacher_email
          );
          return {
            id: `${cls.day}-${idx}`,
            day: cls.day,
            time: formatTimeByOffset(cls.time, tzOffset),
            subject: cls.subject || "TBD",
            teacher_name: teacher ? teacher.name:"",
            zoom_link: teacher ? teacher.zoom_link : "",
          };
        });

      setTodaysClasses(todayCls);
    };

    fetchData();
  }, []);

  const handleJoinClass = async (cls: any) => {
    if (!student) return;

    await supabase.from("attendance").insert([
      {
        student_name: student.name,
        student_roll: student.roll_no,
        teacher_name: cls.teacher_name,
        subject: cls.subject,
        joined_at: new Date().toISOString(),
      },
    ]);

    if (cls.zoom_link) window.open(cls.zoom_link, "_blank");
    else toast({ title: "Zoom Link Missing", description: "Teacher has not added a Zoom link." });
  };

  const handleCancelRequest = async () => {
    if (!reason.trim()) return toast({ title: "Please enter a reason" });
    await supabase.from("cancel_requests").insert([
      { student_id: student.id, student_name: student.name, reason },
    ]);
    toast({ title: "Cancel Request Sent ✅" });
    setReason("");
  };

  const handleComplaintSubmit = async () => {
    if (!complaint.trim()) return toast({ title: "Please enter complaint" });
    await supabase.from("complaints").insert([
      { student_id: student.id, student_name: student.name, complaint },
    ]);
    toast({ title: "Complaint Submitted ✅" });
    setComplaint("");
  };

  const handleSuggestionSubmit = async () => {
    if (!suggestion.trim()) return toast({ title: "Please enter suggestion" });
    await supabase.from("teacher_suggestions").insert([
      {
        student_id: student.id,
        student_name: student.name,
        student_roll: student.roll_no,
        suggestion,
      },
    ]);
    toast({ title: "Suggestion Sent ✅" });
    setSuggestion("");
  };

  if (!student) return <div className="p-8 text-center text-gray-700 font-medium">Loading student info...</div>;

  return (
    <RoleBasedLayout role="student">
      <div className="space-y-8 mt-8 px-4 md:px-12">
        <BannerSlider />
        <h1 className="text-3xl md:text-4xl font-bold text-center text-green-800">
          Welcome, {student.name} (Roll No: {student.roll_no})
        </h1>

        {/* Fee Status */}
        <div className="flex justify-end mt-4">
          {feeStatus === "approved" && (
            <Button disabled className="bg-green-600 text-white cursor-default">✅ Fee Paid</Button>
          )}
          {feeStatus === "pending" && (
            <Button disabled className="bg-yellow-500 text-white cursor-default">⏳ Waiting for Approval</Button>
          )}
        </div>

        {/* Notice Board */}
        <NoticeComponent userRole="student" />

        {/* Today’s Classes */}
    <TodayClassesCard studentId={student.id} timezone={student.timezone} />



        {/* Cancel Request */}
        <Card className="shadow-md border border-red-200 bg-red-50">
          <CardContent className="p-6 space-y-3">
            <h2 className="text-xl font-bold text-red-700">Cancel Class Request</h2>
            <Textarea placeholder="Write reason..." value={reason} onChange={(e) => setReason(e.target.value)} />
            <Button onClick={handleCancelRequest} className="bg-red-600 hover:bg-red-700 text-white">Send Request</Button>
          </CardContent>
        </Card>

        {/* Complaint Box */}
        <Card className="shadow-md border border-yellow-200 bg-yellow-50">
          <CardContent className="p-6 space-y-3">
            <h2 className="text-xl font-bold text-yellow-700">Complaint Box</h2>
            <Textarea placeholder="Write your complaint..." value={complaint} onChange={(e) => setComplaint(e.target.value)} />
            <Button onClick={handleComplaintSubmit} className="bg-yellow-600 hover:bg-yellow-700 text-white">Submit Complaint</Button>
          </CardContent>
        </Card>

        {/* Teacher Suggestion Box */}
        <Card className="shadow-md border border-green-200 bg-green-50">
          <CardContent className="p-6 space-y-3">
            <h2 className="text-xl font-bold text-green-700">Teacher Suggestion</h2>
            <Textarea placeholder="Write your suggestion..." value={suggestion} onChange={(e) => setSuggestion(e.target.value)} />
            <Button onClick={handleSuggestionSubmit} className="bg-green-600 hover:bg-green-700 text-white">Send Suggestion</Button>
          </CardContent>
        </Card>

      </div>
    </RoleBasedLayout>
  );
}
