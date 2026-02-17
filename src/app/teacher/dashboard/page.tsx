"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import TeacherStudents from "@/components/TeacherStudent";
import BannerSlider from "@/components/BannerSlider";
import RoleBasedLayout from "@/components/RoleBasedLayout";
import TeacherSchedule from "@/components/TeacherSchedule";

import Link from "next/link";

// ----------------------------
// 🔹 Helper: Get Cookie
// ----------------------------
function getCookie(name: string) {
  return document.cookie.split("; ").reduce((r, v) => {
    const parts = v.split("=");
    return parts[0].trim() === name ? decodeURIComponent(parts[1]) : r;
  }, "");
}

// ----------------------------
// 🔹 Convert "07:00 PM" → minutes
// ----------------------------
function timeToMinutes(time?: string | null) {
  if (!time || !time.includes(":")) return null;

  const parts = time.split(" ");
  if (parts.length < 1) return null;

  const hm = parts[0];
  const ampm = parts[1]?.toLowerCase();

  let [h, m] = hm.split(":").map(Number);

  if (ampm === "pm" && h !== 12) h += 12;
  if (ampm === "am" && h === 12) h = 0;

  return h * 60 + m;
}


// ----------------------------
// 🔹 Notice Board
// ----------------------------
function NoticeBoard() {
  const [notices, setNotices] = useState<any[]>([]);

  useEffect(() => {
    loadNotices();
  }, []);

  const loadNotices = async () => {
    const { data } = await supabase
      .from("notices")
      .select("*")
      .contains("visible_to", ["teacher"])
      .eq("deleted", false)
      .order("created_at", { ascending: false });

    setNotices(data || []);
  };

  return (
<Card className="shadow-md rounded-2xl border-l-4 border-yellow-500">
      <CardHeader>
        <CardTitle className="text-lg font-bold text-yellow-800">
          📢 Notice Board
        </CardTitle>
      </CardHeader>
      <CardContent>
        {notices.length === 0 ? (
          <p className="text-gray-500 text-center">No new notices.</p>
        ) : (
          <ul className="space-y-3">
            {notices.map((n) => (
              <li key={n.id} className="bg-white border rounded p-3 shadow-sm">
                <h3 className="font-semibold text-green-700">{n.title}</h3>
                <p className="text-gray-700">{n.message}</p>
                <span className="text-xs text-gray-400">
                  {new Date(n.created_at).toLocaleString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

// ----------------------------
// 🔹 Monthly Report
// ----------------------------
function MonthlyReportForm({ teacher }: { teacher: any }) {
  const [month, setMonth] = useState("");
  const [summary, setSummary] = useState("");
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!month || !summary) {
      toast({ title: "⚠️ Missing Info", description: "Fill all required fields." });
      return;
    }

    setLoading(true);

    const { error } = await supabase.from("monthly_reports").insert([
      {
        teacher_id: teacher.id,
        teacher_name: teacher.name,
        month,
        report_summary: summary,
        details,
      },
    ]);

    setLoading(false);

    if (error) {
      toast({ title: "❌ Error", description: error.message });
    } else {
      toast({
        title: "✅ Submitted",
        description: "Monthly report saved successfully.",
      });
      setMonth("");
      setSummary("");
      setDetails("");
    }
  };

  return (
    <Card className="bg-white border shadow">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-center text-gray-700">
          📅 Monthly Report
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="font-medium text-gray-600">Select Month</label>
          <input
            type="month"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="border rounded p-2 w-full"
          />
        </div>
        <div>
          <label className="font-medium text-gray-600">Short Summary</label>
          <input
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            className="border rounded p-2 w-full"
            placeholder="e.g. Excellent progress"
          />
        </div>
        <div>
          <label className="font-medium text-gray-600">Detailed Report</label>
          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            className="border rounded p-2 w-full h-28"
            placeholder="Write details..."
          />
        </div>
        <Button
          onClick={handleSubmit}
          disabled={loading}
          className="bg-green-600 w-full text-white"
        >
          {loading ? "Submitting..." : "Submit Report"}
        </Button>
      </CardContent>
    </Card>
  );
}

// ----------------------------
// 🔹 MAIN TEACHER DASHBOARD
// ----------------------------
export default function TeacherDashboard() {
  const [teacher, setTeacher] = useState<any>(null);
  const [zoomLink, setZoomLink] = useState("");
  const [attendanceStatus, setAttendanceStatus] = useState("");
  const [showSchedule, setShowSchedule] = useState(false);
  const [students, setStudents] = useState<any[]>([]);

  const { toast } = useToast();

  useEffect(() => {
    const roll = getCookie("teacher_roll");
    if (roll) {
      loadTeacher(roll);
      localStorage.setItem("userRole", "teacher");
    }
  }, []);

  const loadStudents = async (teacherId: string) => {
  const { data } = await supabase
    .from("student_teachers")
    .select("students(*)")
    .eq("teacher_id", teacherId);

  if (data) {
    setStudents(data.map((d: any) => d.students).filter(Boolean));
  }
};

  // Load teacher
  const loadTeacher = async (rollNo: string) => {
    const { data } = await supabase
      .from("teachers")
      .select("*")
      .eq("roll_no", rollNo)
      .maybeSingle();

    if (data) {
      setTeacher(data);
     loadStudents(data.id);
      const { data: settings } = await supabase
        .from("settings")
        .select("current_zoom_link")
        .eq("id", 1)
        .maybeSingle();

      setZoomLink(settings?.current_zoom_link || data?.zoom_link || "");
    }
  };

  // ----------------------------
  // 🔹 MARK ATTENDANCE (FINAL FIXED)
  // ----------------------------
  const markAttendance = async () => {
    const today = new Date().toISOString().split("T")[0];

    const now = new Date();
    const formattedNow = now.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
const jobMins = timeToMinutes(teacher.job_time);
const nowMins = timeToMinutes(formattedNow);

if (jobMins === null || nowMins === null) {
  toast({
    title: "⚠️ Job Time Missing",
    description: "Teacher job time set nahi hai. Admin se contact karein.",
  });
  return;
}


    const isLate = nowMins > jobMins;
    const minutesLate = isLate ? nowMins - jobMins : 0;
    const status = isLate ? "late" : "present";

    const { error } = await supabase.from("teacher_attendance").insert([
      {
        teacher_id: teacher.id,
        teacher_name: teacher.name,
        attendance_date: today,
        job_time: teacher.job_time,
        attendance_time: formattedNow,
        status,
        minutes_late: minutesLate,
      },
    ]);

    if (error) {
      toast({ title: "❌ Error", description: error.message });
    } else {
      setAttendanceStatus(status);
      toast({
        title: "✅ Attendance Marked",
        description: `Marked as ${status.toUpperCase()}.`,
      });
    }
  };

 
  if (!teacher)
    return <p className="text-center mt-10 text-gray-500">Loading...</p>;

  return (
    <RoleBasedLayout role="teacher">
<div className="space-y-8 pb-10">
  <BannerSlider />

        <div className="text-center space-y-2">
  <h1 className="text-4xl font-bold text-green-800">
    👋 Welcome, {teacher.name}
  </h1>
</div>

<Card className="shadow-md rounded-2xl">
  <CardContent className="flex flex-col md:flex-row justify-center items-center gap-4 p-6">
    
    <Button
    onClick={() => setShowSchedule((prev) => !prev)}
    className="bg-blue-600 text-white"
  >
    📅 {showSchedule ? "Hide" : "Show"} Today Schedule
  </Button>
{showSchedule && (
  <TeacherSchedule students={students} teacher={teacher} />
)}

      

    <Link href="/teacher/syllabus">
      <Button className="bg-purple-600 hover:bg-purple-700 text-white px-6">
        📚 View Syllabus
      </Button>
    </Link>

  </CardContent>
</Card>



        <NoticeBoard />

        {/* ZOOM + REMINDER */}
        
            <Button
              onClick={markAttendance}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg text-lg"
            >
              Mark Attendance
            </Button>

            {attendanceStatus && (
              <p className="text-lg font-semibold">
                Status:{" "}
                <span
                  className={
                    attendanceStatus === "late"
                      ? "text-red-600"
                      : "text-green-600"
                  }
                >
                  {attendanceStatus.toUpperCase()}
                </span>
              </p>
            )}
 
      <Card className="shadow-md rounded-2xl">
  <CardHeader>
    <CardTitle className="text-xl text-center text-gray-700">
      🧑‍🎓 Assigned Students & Weekly Report
    </CardTitle>
  </CardHeader>
  <CardContent>
    {teacher.id ? (
      <TeacherStudents teacherId={teacher.id} />
    ) : (
      <p className="text-center text-gray-500">
        No assigned students found.
      </p>
    )}
  </CardContent>
</Card>

      </div>
    </RoleBasedLayout>
  );
}