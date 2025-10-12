"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import AttendanceTable from "@/components/AttendanceTable";

interface AttendanceRecord {
  id: string;
  student: string;
  teacher_name: string;
  subject: string;
  join_time: string;
  join_date: string;
}

export default function AttendancePage() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAttendance();
  }, []);

  const fetchAttendance = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("attendance")
      .select(
        `
        id,
        join_time,
        join_date,
        students ( name ),
        classes ( teacher_name, subject )
      `
      );

    if (error) {
      console.error("❌ Error fetching attendance:", error.message);
      setLoading(false);
      return;
    }

    // Map supabase response to AttendanceRecord type
    const formatted: AttendanceRecord[] =
      data?.map((rec: any) => ({
        id: rec.id,
        join_time: rec.join_time,
        join_date: rec.join_date,
        student: rec.students?.name || "Unknown",
        teacher_name: rec.classes?.teacher_name || "Unknown",
        subject: rec.classes?.subject || "N/A",
      })) || [];

    setRecords(formatted);
    setLoading(false);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">📋 Attendance Records</h1>

      {loading ? (
        <p>Loading attendance...</p>
      ) : records.length === 0 ? (
        <p className="text-gray-500">No attendance records found.</p>
      ) : (
        <AttendanceTable data={records} />
      )}
    </div>
  );
}
