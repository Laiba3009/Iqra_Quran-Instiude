"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function TeacherAttendancePage() {
  const [teachers, setTeachers] = useState([]);
  const [records, setRecords] = useState([]);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [selectedTeacher, setSelectedTeacher] = useState(""); // Initially empty
  const [dateInputVisible, setDateInputVisible] = useState(false);
  const [dateForMarking, setDateForMarking] = useState("");
  const [statusToMark, setStatusToMark] = useState("");

  const monthNames = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December"
  ];

  const daysInMonth = new Date(year, month, 0).getDate();
  const days = [...Array(daysInMonth)].map((_, i) => i + 1);

  useEffect(() => {
    loadTeachers();
  }, []);

  useEffect(() => {
    loadAttendance();
  }, [month, year]);

  const loadTeachers = async () => {
    const { data } = await supabase.from("teachers").select("*");
    setTeachers(data || []);
  };

  const loadAttendance = async () => {
    const from = `${year}-${String(month).padStart(2, "0")}-01`;
    const to = `${year}-${String(month).padStart(2, "0")}-${daysInMonth}`;
    const { data } = await supabase
      .from("teacher_attendance")
      .select("*")
      .gte("attendance_date", from)
      .lte("attendance_date", to);

    setRecords(data || []);
  };

  const getStatus = (teacherId, day) => {
    const dateString = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const record = records.find(
      (r) => r.teacher_id === teacherId && r.attendance_date === dateString
    );

    if (!record) return "";
    if (record.status === "present") return "P";
    if (record.status === "late") return "L";
    if (record.status === "absent") return "A";
    if (record.status === "leave") return "LV";
    return "";
  };

  const markStatus = async (teacherId, date, status) => {
    if (!teacherId || !date) return;
    const teacher = teachers.find(t => t.id === teacherId);
    if (!teacher) return;

    await supabase.from("teacher_attendance").insert([
      {
        teacher_id: teacher.id,
        teacher_name: teacher.name,
        attendance_date: date,
        status,
        job_time: null,
        attendance_time: null,
        minutes_late: null,
      },
    ]);
    loadAttendance();
    alert("✅ Done");
    setDateInputVisible(false);
    setDateForMarking("");
  };

  const clearMonthRecords = async () => {
    if (!confirm("Are you sure you want to clear all records for this month?")) return;
    const from = `${year}-${String(month).padStart(2, "0")}-01`;
    const to = `${year}-${String(month).padStart(2, "0")}-${daysInMonth}`;
    await supabase.from("teacher_attendance").delete()
      .gte("attendance_date", from)
      .lte("attendance_date", to);
    loadAttendance();
    alert("✅ All records for this month cleared");
  };

  return (
    <div className="p-6">

      {/* TITLE + MONTH + TEACHER SELECT + BUTTONS */}
      <div className="flex flex-col sm:flex-row items-center justify-between mb-6 mt-20 gap-4">
        <h1 className="text-3xl font-bold text-green-800">
          📅 Teacher Attendance Register
        </h1>

        <div className="flex flex-wrap items-center gap-2">
          {/* Month select */}
          <select
            className="border rounded px-3 py-2 text-lg font-semibold"
            value={month}
            onChange={(e) => setMonth(Number(e.target.value))}
          >
            {monthNames.map((m, i) => (
              <option key={i} value={i + 1}>{m} {year}</option>
            ))}
          </select>

          {/* Teacher select */}
          <select
            className="border rounded px-3 py-2 text-lg font-semibold"
            value={selectedTeacher}
            onChange={(e) => setSelectedTeacher(e.target.value)}
          >
            <option value="">Select Teacher</option> {/* Empty option */}
            {teachers.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
          </select>

          {/* Buttons */}
          {selectedTeacher && (
            <>
              <button
                className="px-3 py-2 bg-red-500 text-white rounded"
                onClick={() => { setStatusToMark("absent"); setDateInputVisible(true); }}
              >
                Mark Absent
              </button>
              <button
                className="px-3 py-2 bg-blue-500 text-white rounded"
                onClick={() => { setStatusToMark("leave"); setDateInputVisible(true); }}
              >
                Mark Leave
              </button>
              <button
                className="px-3 py-2 bg-gray-500 text-white rounded"
                onClick={clearMonthRecords}
              >
                Clear Month
              </button>
            </>
          )}
        </div>
      </div>

      {/* Date input modal */}
      {dateInputVisible && (
        <div className="mb-4 flex items-center gap-2">
          <label className="font-semibold">Select Date:</label>
          <input
            type="date"
            value={dateForMarking}
            onChange={(e) => setDateForMarking(e.target.value)}
            min={`${year}-${String(month).padStart(2, "0")}-01`}
            max={`${year}-${String(month).padStart(2, "0")}-${daysInMonth}`}
            className="border rounded px-2 py-1"
          />
          <button
            className="px-3 py-2 bg-green-500 text-white rounded"
            disabled={!dateForMarking}
            onClick={() => markStatus(selectedTeacher, dateForMarking, statusToMark)}
          >
            Done
          </button>
          <button
            className="px-3 py-2 bg-gray-300 text-black rounded"
            onClick={() => { setDateInputVisible(false); setDateForMarking(""); }}
          >
            Cancel
          </button>
        </div>
      )}

      {/* ATTENDANCE TABLE */}
      <div className="overflow-auto border rounded-xl shadow-lg">
        <table className="min-w-full border-collapse text-sm">
          <thead>
            <tr className="bg-green-600 text-white">
              <th className="border p-3 w-40">Teacher</th>
              {days.map((d) => (
                <th key={d} className="border p-2 text-center w-10">{d}</th>
              ))}
            </tr>
          </thead>

          <tbody>
            {teachers.map((t) => (
              <tr key={t.id} className="border hover:bg-gray-50">
                <td className="border p-3 font-semibold bg-gray-100">{t.name}</td>
                {days.map((d) => {
                  const status = getStatus(t.id, d);
                  return (
                    <td key={d} className="border text-center font-bold p-1">
                      <div className={`${
                        status === "P" ? "text-green-700" :
                        status === "L" ? "text-orange-600" :
                        status === "A" ? "text-red-600" :
                        status === "LV" ? "text-blue-600" : ""
                      }`}>{status}</div>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
