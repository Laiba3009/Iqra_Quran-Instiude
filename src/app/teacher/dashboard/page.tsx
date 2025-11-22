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
// 🔹 Notice Board Component
// ----------------------------
function NoticeBoard() {
  const [notices, setNotices] = useState<any[]>([]);
  
  useEffect(() => {
    loadNotices();
  }, []);

  const loadNotices = async () => {
    const { data, error } = await supabase
      .from("notices")
      .select("*")
      .contains("visible_to", ["teacher"])
      .eq("deleted", false)
      .order("created_at", { ascending: false });

    if (!error) setNotices(data || []);
  };

  return (
    <Card className="bg-yellow-50 border border-yellow-200 shadow">
      <CardHeader>
        <CardTitle className="text-lg font-bold text-yellow-800">📢 Notice Board</CardTitle>
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
// 🔹 Monthly Report Form
// ----------------------------
function MonthlyReportForm({ teacher }: { teacher: any }) {
  const [month, setMonth] = useState("");
  const [summary, setSummary] = useState("");
  const [details, setDetails] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!month || !summary) {
      toast({ title: "⚠️ Missing Info", description: "Please fill all required fields." });
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
      toast({ title: "✅ Submitted", description: "Monthly report saved successfully." });
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
      <CardContent className="space-y-3">
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
            placeholder="e.g. Excellent progress this month"
            className="border rounded p-2 w-full"
          />
        </div>
        <div>
          <label className="font-medium text-gray-600">Detailed Report</label>
          <textarea
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder="Write more details..."
            className="border rounded p-2 w-full h-28"
          ></textarea>
        </div>
        <Button
          onClick={handleSubmit}
          disabled={loading}
          className="bg-green-600 hover:bg-green-700 text-white w-full"
        >
          {loading ? "Submitting..." : "Submit Monthly Report"}
        </Button>
      </CardContent>
    </Card>
  );
}

// ----------------------------
// 🔹 Main Teacher Dashboard
// ----------------------------
export default function TeacherDashboard() {
  const [teacher, setTeacher] = useState<any>(null);
  const [zoomLink, setZoomLink] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    const roll = getCookie("teacher_roll");
    if (roll) {
      loadTeacher(roll);
      localStorage.setItem("userRole", "teacher");
    }
  }, []);

  const loadTeacher = async (rollNo: string) => {
    const { data, error } = await supabase
      .from("teachers")
      .select("*")
      .eq("roll_no", rollNo)
      .maybeSingle();

    if (error || !data) return;

    setTeacher(data);

    const { data: settings } = await supabase
      .from("settings")
      .select("current_zoom_link")
      .eq("id", 1)
      .maybeSingle();

    setZoomLink(settings?.current_zoom_link || data?.zoom_link || "");
  };

  const sendReminder = () => {
    toast({
      title: "Reminder Sent 📩",
      description: "Students will be reminded via configured system.",
    });
  };

  if (!teacher) return <p className="text-center text-gray-500 mt-10">Loading teacher info...</p>;

  return (
    <RoleBasedLayout role="teacher">
      <div className="p-6 space-y-10">
        <BannerSlider />

        <h1 className="text-3xl font-bold text-center text-green-800">
          Welcome, {teacher.name}
        </h1>

        <NoticeBoard />

        {/* Zoom Controls */}
        <Card className="shadow-lg border bg-white">
          <CardContent className="flex flex-wrap justify-center gap-3 p-4">
            <a
              href={zoomLink || "#"}
              target="_blank"
              className={`px-5 py-2 rounded-lg text-white font-medium ${
                zoomLink ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-400 cursor-not-allowed"
              }`}
            >
              Join Zoom Class
            </a>

            <Button
              onClick={sendReminder}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Send Reminder
            </Button>
          </CardContent>
        </Card>

        {/* Assigned Syllabus */}
        <Card className="bg-gray-50 border shadow">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-center text-gray-700">
              Assigned Syllabus
            </CardTitle>
          </CardHeader>
          <CardContent>
            {teacher.syllabus?.length ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {teacher.syllabus.map((subject: string, i: number) => (
                  <Link
                    key={i}
                    href={`/teacher/syllabus/${subject.toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    <div className="p-4 border rounded-lg bg-white hover:bg-green-50 shadow-sm hover:shadow-md transition cursor-pointer">
                      <h3 className="font-semibold text-green-700 text-lg">📘 {subject}</h3>
                      <p className="text-sm text-gray-600 mt-1">Click to view {subject} syllabus.</p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center">No syllabus assigned yet.</p>
            )}
          </CardContent>
        </Card>

        {/* Assigned Students + Weekly Progress */}
        <Card className="border shadow bg-white">
          <CardHeader>
            <CardTitle className="text-xl font-semibold text-center text-gray-700">
              🧑‍🎓 Assigned Students & Weekly Report
            </CardTitle>
          </CardHeader>
          <CardContent>
            {teacher.id ? (
              <TeacherStudents teacherId={teacher.id} />
            ) : (
              <p className="text-center text-gray-500">No students assigned.</p>
            )}
          </CardContent>
        </Card>

        {/* Monthly Report Section */}

        <p className="text-sm text-gray-400 text-center">
          Zoom link and syllabus are managed by Admin.
        </p>
      </div>
    </RoleBasedLayout>
  );
}
