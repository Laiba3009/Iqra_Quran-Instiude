"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

function getCookie(name: string) {
  return document.cookie.split("; ").reduce((r, v) => {
    const parts = v.split("=");
    return parts[0].trim() === name ? decodeURIComponent(parts[1]) : r;
  }, "");
}

export default function TeacherViewAttendance() {
  const [teacher, setTeacher] = useState<any | null>(null);
  const [records, setRecords] = useState<any[]>([]);
  const today = new Date();
  const [month, setMonth] = useState<number>(today.getMonth() + 1);
  const [year, setYear] = useState<number>(today.getFullYear());
  const [loading, setLoading] = useState(false);

  const monthNames = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];

  useEffect(() => {
    const roll = getCookie("teacher_roll");
    if (roll) {
      loadTeacherByRoll(roll);
    }
  }, []);

  useEffect(() => {
    if (teacher) loadAttendance();
  }, [teacher, month, year]);

  const loadTeacherByRoll = async (rollNo: string) => {
    const { data } = await supabase
      .from("teachers")
      .select("*")
      .eq("roll_no", rollNo)
      .maybeSingle();

    setTeacher(data || null);
  };

  const loadAttendance = async () => {
    if (!teacher) return;
    setLoading(true);

    const daysInMonth = new Date(year, month, 0).getDate();
    const from = `${year}-${String(month).padStart(2, "0")}-01`;
    const to = `${year}-${String(month).padStart(2, "0")}-${String(daysInMonth).padStart(2, "0")}`;

    const { data } = await supabase
      .from("teacher_attendance")
      .select("*")
      .eq("teacher_id", teacher.id)
      .gte("attendance_date", from)
      .lte("attendance_date", to)
      .order("attendance_date", { ascending: true });

    setRecords(data || []);
    setLoading(false);
  };

  // ⭐ FIXED: latest record per date only
  const latestRecordPerDate = records.reduce((acc: any, r: any) => {
    acc[r.attendance_date] = r; // last value overwrite → latest record
    return acc;
  }, {});

  const daysInMonth = new Date(year, month, 0).getDate();
  const days = [...Array(daysInMonth)].map((_, i) => i + 1);

  const formatStatus = (r: any) => {
    if (!r) return "";
    if (r.status === "present") return "P";
    if (r.status === "late") return "L";
    if (r.status === "absent") return "A";
    if (r.status === "leave") return "LV";
    return "";
  };

  const statusColorClass = (s: string) => {
    if (s === "P") return "text-green-700";
    if (s === "L") return "text-orange-600";
    if (s === "A") return "text-red-600";
    if (s === "LV") return "text-blue-600";
    return "text-gray-500";
  };

  // ⭐ FIXED SUMMARY: count only latest entry of each date
  const summaryCounts = Object.values(latestRecordPerDate).reduce(
    (acc: any, r: any) => {
      if (r.status === "present") acc.present++;
      if (r.status === "late") acc.late++;
      if (r.status === "absent") acc.absent++;
      if (r.status === "leave") acc.leave++;
      return acc;
    },
    { present: 0, late: 0, absent: 0, leave: 0 }
  );

  return (
    <div className="p-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 mt-20">
        <div>
          <h1 className="text-2xl text-center font-bold text-green-800">📊 My Attendance</h1>
          <p className="text-sm text-gray-500 mt-1">
            {teacher ? teacher.name : "Loading..."}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            className="border rounded px-3 py-2"
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
          >
            {monthNames.map((m, i) => (
              <option key={i} value={i + 1}>{m}</option>
            ))}
          </select>

          <select
            className="border rounded px-3 py-2"
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
          >
            {Array.from({ length: 6 }).map((_, idx) => {
              const y = today.getFullYear() - 2 + idx;
              return (
                <option key={y} value={y}>{y}</option>
              );
            })}
          </select>
        </div>
      </div>

      <div className="bg-white border rounded-lg shadow-sm p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm text-gray-600">
            Showing: <span className="font-semibold">{monthNames[month - 1]} {year}</span>
          </div>

          {/* SUMMARY FIXED */}
          <div className="flex gap-4 text-sm">
            <div>Present: <span className="font-semibold text-green-700">{summaryCounts.present}</span></div>
            <div>Late: <span className="font-semibold text-orange-600">{summaryCounts.late}</span></div>
            <div>Absent: <span className="font-semibold text-red-600">{summaryCounts.absent}</span></div>
            <div>Leave: <span className="font-semibold text-blue-600">{summaryCounts.leave}</span></div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading attendance...</div>
        ) : (
          <div className="overflow-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="bg-green-600 text-white">
                  <th className="p-2 text-left w-44">Date</th>
                  <th className="p-2 text-left">Status</th>
                  <th className="p-2 text-left">Time / Late (mins)</th>
                  <th className="p-2 text-left hidden md:table-cell">Notes</th>
                </tr>
              </thead>

              <tbody>
                {days.map((d) => {
                  const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
                  const rec = latestRecordPerDate[dateStr];
                  const statusLetter = formatStatus(rec);
                  const colorClass = statusColorClass(statusLetter);

                  return (
                    <tr key={d} className="border-b hover:bg-gray-50">
                      <td className="p-2 font-medium">{dateStr}</td>
                      <td className={`p-2 ${colorClass} font-semibold`}>{statusLetter || "-"}</td>
                      <td className="p-2">
                        {rec ? (
                          <>
                            <div>{rec.attendance_time || "—"}</div>
                            <div className="text-xs text-gray-500">
                              {rec.minutes_late != null ? `${rec.minutes_late} min late` : ""}
                            </div>
                          </>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="p-2 hidden md:table-cell">
                        {rec?.job_time ? `Scheduled: ${rec.job_time}` : ""}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {!teacher && (
        <div className="mt-6 text-sm text-red-600">
          Teacher not found. Make sure you are logged in as a teacher (teacher_roll cookie).
        </div>
      )}
    </div>
  );
}
