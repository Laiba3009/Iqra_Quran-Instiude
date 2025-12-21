"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog } from "@headlessui/react";
import moment from "moment-timezone";

/* ================= TYPES ================= */

interface DaySchedule {
  time: string;
  subjects: string[];
}

interface ClassInfo {
  id: string;
  day: string;
  teacher_name: string;
  schedule: DaySchedule[];
  zoom_link: string;
  google_meet_link: string;
}

/* ================= TIME CONVERTER ================= */

function utcToLocal(utcTime: string, timezone: string) {
  if (!utcTime || !timezone) return "—";
  return moment.utc(utcTime, "HH:mm").tz(timezone).format("hh:mm A");
}

/* ================= COMPONENT ================= */

export default function ClassSchedulePage() {
  const [classes, setClasses] = useState<ClassInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [studentName, setStudentName] = useState("");

  // Cancel modal state
  const [openCancelModal, setOpenCancelModal] = useState(false);
  const [cancelClass, setCancelClass] = useState<ClassInfo | null>(null);
  const [cancelSubject, setCancelSubject] = useState<string>("");
  const [cancelReason, setCancelReason] = useState("Cancel today's class");

  const getCookie = (name: string) => {
    const match = document.cookie.match(
      new RegExp("(^| )" + name + "=([^;]+)")
    );
    return match ? match[2] : null;
  };

  useEffect(() => {
    loadSchedule();
  }, []);

  /* ================= LOAD SCHEDULE ================= */

  const loadSchedule = async () => {
    setLoading(true);
    try {
      const rollNo = getCookie("student_roll");
      if (!rollNo) return;

      const { data: student } = await supabase
        .from("students")
        .select("id, name, timezone, class_days")
        .eq("roll_no", rollNo)
        .maybeSingle();

      if (!student) return;

      setStudentName(student.name);

      const { data: teacherMap } = await supabase
        .from("student_teachers")
        .select("teacher_id, teachers(name, zoom_link, google_meet_link)")
        .eq("student_id", student.id);

      const teacher =
        teacherMap && teacherMap.length > 0
          ? {
              name: teacherMap[0].teachers?.name || "TBD",
              zoom_link: teacherMap[0].teachers?.zoom_link || "",
              google_meet_link:
                teacherMap[0].teachers?.google_meet_link || "",
            }
          : { name: "TBD", zoom_link: "", google_meet_link: "" };

      const grouped: Record<string, ClassInfo> = {};

      (student.class_days || []).forEach((cd: any) => {
        const localTime = utcToLocal(cd.time, student.timezone);
        const day = cd.day;

        if (!grouped[day]) {
          grouped[day] = {
            id: day,
            day,
            teacher_name: teacher.name,
            schedule: [],
            zoom_link: teacher.zoom_link,
            google_meet_link: teacher.google_meet_link,
          };
        }

        let timeBlock = grouped[day].schedule.find(
          (s) => s.time === localTime
        );

        if (!timeBlock) {
          timeBlock = { time: localTime, subjects: [] };
          grouped[day].schedule.push(timeBlock);
        }

        if (cd.subject && !timeBlock.subjects.includes(cd.subject)) {
          timeBlock.subjects.push(cd.subject);
        }
      });

      setClasses(Object.values(grouped));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /* ================= JOIN CLASS ================= */

  const handleJoinClass = async (
    cls: ClassInfo,
    platform: "zoom" | "google"
  ) => {
    try {
      const rollNo = getCookie("student_roll");
      if (!rollNo) return;

      const { data: student } = await supabase
        .from("students")
        .select("name, roll_no")
        .eq("roll_no", rollNo)
        .maybeSingle();

      if (!student) return;

      await supabase.from("attendance").insert([
        {
          student_name: student.name,
          student_roll: student.roll_no,
          teacher_name: cls.teacher_name,
          subject: "Multiple",
          joined_at: new Date().toISOString(),
        },
      ]);

      const link =
        platform === "zoom" ? cls.zoom_link : cls.google_meet_link;
      if (link) window.open(link, "_blank");
    } catch (err) {
      console.error("Join error:", err);
    }
  };

  /* ================= CANCEL CLASS ================= */

  const openCancel = (cls: ClassInfo) => {
    setCancelClass(cls);
    setCancelReason("Cancel today's class");

    // Automatically select subject if only one
    const allSubjects = cls.schedule.flatMap((s) => s.subjects);
    if (allSubjects.length === 1) setCancelSubject(allSubjects[0]);
    else setCancelSubject("");

    setOpenCancelModal(true);
  };

  const sendCancelRequest = async () => {
    if (!cancelClass || !cancelSubject) {
      alert("Please select a subject to cancel!");
      return;
    }

    const studentRoll = getCookie("student_roll");

    await supabase.from("class_cancellations").insert([
      {
        student_name: studentName,
        student_roll: studentRoll,
        teacher_name: cancelClass.teacher_name,
        day: cancelClass.day,
        time: cancelClass.schedule
          .find((s) => s.subjects.includes(cancelSubject))?.time,
        subject: cancelSubject,
        reason: cancelReason,
      },
    ]);

    setOpenCancelModal(false);
    alert("Class cancellation request sent to teacher!");
  };

  /* ================= UI ================= */

  if (loading)
    return <p className="text-center mt-10">Loading schedule...</p>;

  return (
    <div className="max-w-5xl mx-auto mt-20 p-6 space-y-6">
      <h1 className="text-3xl font-bold text-green-800 text-center">
        📅 {studentName}'s Class Schedule
      </h1>

      {classes.length === 0 ? (
        <p className="text-center text-gray-600">No classes found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classes.map((cls) => (
            <Card key={cls.id} className="shadow-md border-green-200">
              <CardContent className="p-4 space-y-3">
                <h2 className="text-xl font-semibold text-green-700">
                  {cls.day}
                </h2>

                <p className="text-gray-700">
                  <b>Teacher:</b> {cls.teacher_name}
                </p>

                <div className="text-gray-700 space-y-1">
                  <b>Schedule:</b>
                  {cls.schedule.map((s) => (
                    <div key={s.time} className="ml-3">
                      • <b>{s.time}</b> → {s.subjects.join(", ")}
                    </div>
                  ))}
                </div>

                {/* Cancel Class button (once per card) */}
                <Button
                  className="bg-red-600 hover:bg-red-700 text-white mt-2"
                  onClick={() => openCancel(cls)}
                >
                  Cancel Class
                </Button>

                <div className="flex gap-2 pt-2">
                  <Button
                    className="bg-green-600 hover:bg-green-700 text-white w-1/2"
                    disabled={!cls.zoom_link}
                    onClick={() => handleJoinClass(cls, "zoom")}
                  >
                    Zoom
                  </Button>

                  <Button
                    className={`w-1/2 text-white ${
                      cls.google_meet_link
                        ? "bg-pink-500 hover:bg-pink-600"
                        : "bg-gray-400 cursor-not-allowed"
                    }`}
                    disabled={!cls.google_meet_link}
                    onClick={() => handleJoinClass(cls, "google")}
                  >
                    Google Meet
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* ================= CANCEL MODAL ================= */}
      <Dialog
        open={openCancelModal}
        onClose={() => setOpenCancelModal(false)}
        className="fixed z-50 inset-0 flex items-center justify-center bg-black bg-opacity-50"
      >
        <Dialog.Panel className="bg-white rounded-lg p-6 w-96 space-y-4">
          <Dialog.Title className="text-xl font-bold text-red-700">
            Cancel Class
          </Dialog.Title>

          {cancelClass && (
            <>
              <p>
                <b>Day:</b> {cancelClass.day}
              </p>

              {/* Select Subject */}
              <select
                className="border rounded-lg p-2 w-full mt-2"
                value={cancelSubject}
                onChange={(e) => setCancelSubject(e.target.value)}
              >
                <option value="" disabled>Select subject</option>
                {cancelClass.schedule
                  .flatMap((s) => s.subjects)
                  .map((subj) => (
                    <option key={subj} value={subj}>{subj}</option>
                  ))}
              </select>

              <textarea
                className="border rounded-lg p-2 w-full mt-2"
                rows={3}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
              ></textarea>

              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setOpenCancelModal(false)}
                >
                  Close
                </Button>

                <Button
                  className="bg-red-600 hover:bg-red-700 text-white"
                  onClick={sendCancelRequest}
                >
                  Send
                </Button>
              </div>
            </>
          )}
        </Dialog.Panel>
      </Dialog>
    </div>
  );
}
