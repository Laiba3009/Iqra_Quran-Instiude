'use client';

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";
import BannerSlider from "@/components/BannerSlider";

// ----------------------------
// 🔹 Helper: get cookie
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
export default function TeacherDashboard() {
  const [teacher, setTeacher] = useState<any>(null);
  const [zoomLink, setZoomLink] = useState("");
  const { toast } = useToast();

  // ----------------------------
  // 🔹 Load teacher info
  // ----------------------------
  useEffect(() => {
    const roll = getCookie("teacher_roll");
    if (roll) loadTeacher(roll);
  }, []);

  const loadTeacher = async (rollNo: string) => {
    const { data } = await supabase
      .from("teachers")
      .select("*")
      .eq("roll_no", rollNo)
      .maybeSingle();

    setTeacher(data);

    const { data: settings } = await supabase
      .from("settings")
      .select("current_zoom_link")
      .eq("id", 1)
      .maybeSingle();

    setZoomLink(settings?.current_zoom_link || data?.zoom_link || "");
  };

  // ----------------------------
  // 🔹 Reminder Stub
  // ----------------------------
  const sendReminder = async () => {
    toast({
      title: "Reminder Sent 📩",
      description: "Configured reminder system will send this shortly.",
    });
  };

  if (!teacher)
    return (
      <div className="p-8 text-center text-gray-700 font-medium">
        Loading teacher info...
      </div>
    );

  // ----------------------------
  // 🔹 UI Layout
  // ----------------------------
  return (
    <div className="space-y-8 mt-8 px-4 md:px-12">
      {/* Banner */}
      <BannerSlider />

      {/* Welcome */}
      <h1 className="text-3xl md:text-4xl font-bold text-center text-green-800">
        Welcome, {teacher.name}
      </h1>

      {/* Main Card Section */}
      <Card className="shadow-xl border border-gray-200 bg-white">
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-center text-purple-700 mb-6">
          Teacher Dashboard
        </h1>

        <CardContent className="space-y-6">
          {/* Zoom + Reminder */}
          <div className="flex flex-wrap justify-center gap-3 mb-4">
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

            <Button
              onClick={sendReminder}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Send Reminder
            </Button>
          </div>

          {/* Assigned Syllabus */}
          <div className="bg-gray-50 p-4 rounded-xl border">
            <h2 className="text-xl font-semibold text-gray-700 mb-3 text-center">
              Assigned Syllabus
            </h2>

            {teacher.syllabus?.length ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {teacher.syllabus.map((subject: string, i: number) => (
                  <Link
                    key={i}
                    href={`/teacher/syllabus/${subject
                      .toLowerCase()
                      .replace(/\s+/g, "-")}`}
                  >
                    <div className="p-4 border rounded-lg bg-white hover:bg-green-50 cursor-pointer transition shadow-sm hover:shadow-md">
                      <h3 className="font-semibold text-green-700 text-lg">
                        📘 {subject}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Click to view {subject} syllabus.
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center">
                No syllabus assigned yet.
              </p>
            )}
          </div>

          {/* Footer Note */}
          <p className="text-sm text-gray-500 text-center mt-4">
            Zoom link and syllabus are managed by Admin.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
