"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import TeacherStudents from "@/components/TeacherStudent";
import BannerSlider from "@/components/BannerSlider";
import RoleBasedLayout from "@/components/RoleBasedLayout";
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
function timeToMinutes(time: string) {
  const [hm, ampm] = time.split(" ");
  let [h, m] = hm.split(":").map(Number);

  if (ampm?.toLowerCase() === "pm" && h !== 12) h += 12;
  if (ampm?.toLowerCase() === "am" && h === 12) h = 0;

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
    <Card className="bg-yellow-50 border border-yellow-200 shadow">
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
  const { toast } = useToast();

  useEffect(() => {
    const roll = getCookie("teacher_roll");
    if (roll) {
      loadTeacher(roll);
      localStorage.setItem("userRole", "teacher");
    }
  }, []);

  // Load teacher
  const loadTeacher = async (rollNo: string) => {
    const { data } = await supabase
      .from("teachers")
      .select("*")
      .eq("roll_no", rollNo)
      .maybeSingle();

    if (data) {
      setTeacher(data);

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
      <div className="p-6 space-y-10">
        <BannerSlider />

        <h1 className="text-3xl font-bold text-center text-green-800">
          Welcome, {teacher.name}
        </h1>

        <NoticeBoard />

        {/* ZOOM + REMINDER */}
        <Card className="shadow-lg border bg-white">
          <CardContent className="flex flex-wrap justify-center gap-3 p-4">
            <a
              href={zoomLink || "#"}
              target="_blank"
              className={`px-5 py-2 rounded-lg text-white font-medium ${
                zoomLink
                  ? "bg-blue-600 hover:bg-blue-700"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
            >
              Join Zoom Class
            </a>

    <a
      href={teacher.google_meet_link || "#"}  // teacher ke Google Meet link
      target="_blank"
      rel="noopener noreferrer"
      className={`px-5 py-2 rounded-lg text-white font-medium ${
        teacher.google_meet_link
          ? "bg-blue-600 hover:bg-pink-500"
          : "bg-gray-400 cursor-not-allowed"
      }`}
    >
      Join Google Meet Class
    </a>
        
          <CardContent className="text-center space-y-3">
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
          </CardContent>
  </CardContent>
</Card>

        

        {/* ATTENDANCE BUTTON */}
       

        {/* SYLLABUS */}
        <Card className="bg-gray-50 border shadow">
          <CardHeader>
            <CardTitle className="text-xl text-center text-gray-700">
              Assigned Syllabus
            </CardTitle>
          </CardHeader>
          <CardContent>
            {teacher.syllabus?.length ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {teacher.syllabus.map((subject: string, i: number) => (
                  <Link
                    key={i}
                    href={`/teacher/syllabus/${subject
                      .toLowerCase()
                      .replace(/\s+/g, "-")}`}
                  >
                    <div className="p-4 border rounded-lg bg-white hover:bg-green-50 shadow-sm hover:shadow-md transition cursor-pointer">
                      <h3 className="font-semibold text-green-700 text-lg">
                        📘 {subject}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Click to view details.
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500">No syllabus assigned.</p>
            )}
          </CardContent>
        </Card>

        {/* STUDENTS */}
        <Card className="border shadow bg-white">
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
