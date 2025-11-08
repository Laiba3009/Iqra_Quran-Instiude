'use client';

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import Link from "next/link";

interface Attendance {
  id: string;
  student_name: string;
  roll_no: string;
  class_time: string;
  teacher_name: string;
  status: string;
  date: string;
}

export default function ViewAttendance() {
  const [attendanceList, setAttendanceList] = useState<Attendance[]>([]);
  const [month, setMonth] = useState<string>(String(new Date().getMonth() + 1));
  const { toast } = useToast();

  useEffect(() => {
    loadAttendance();
  }, [month]);

  const loadAttendance = async () => {
    const year = new Date().getFullYear();
    const startDate = `${year}-${month.padStart(2, "0")}-01`;
    const endDateObj = new Date(year, parseInt(month), 0);
    const endDate = `${year}-${month.padStart(2, "0")}-${String(endDateObj.getDate()).padStart(2, "0")}`;

    const { data, error } = await supabase
      .from("tsattendance_view")
      .select("*")
      .gte("date", startDate)
      .lte("date", endDate)
      .order("date", { ascending: false });

    if (error) {
      toast({ title: "Error", description: "Failed to load attendance." });
      return;
    }

    setAttendanceList(data || []);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from("tsattendance")
      .delete()
      .eq("id", id);

    if (error) {
      toast({ title: "Error", description: "Failed to delete attendance." });
    } else {
      toast({ title: "✅ Deleted", description: "Attendance record deleted." });
      setAttendanceList(prev => prev.filter(a => a.id !== id));
    }
  };

  return (
    <div className="p-6">
      {/* 🔹 Back Button */}
      <div className="mb-4">
        <Link href="/teacher/dashboard">
          <Button className="bg-blue-800 hover:bg-blue-700text-white">
            ← Back
          </Button>
        </Link>
      </div>

      {/* 🔹 Title Centered */}
      <h1 className="text-2xl font-bold mb-6 text-center">View Attendance</h1>

      {/* 🔹 Month Filter */}
      <div className="mb-4 flex gap-4 items-center justify-center">
        <label className="font-medium">Select Month:</label>
        <select
          value={month}
          onChange={(e) => setMonth(e.target.value)}
          className="border p-2 rounded"
        >
          {[...Array(12).keys()].map(i => {
            const m = i + 1;
            return (
              <option key={m} value={String(m).padStart(2, '0')}>
                {new Date(0, i).toLocaleString('en', { month: 'long' })}
              </option>
            )
          })}
        </select>
      </div>

      {/* 🔹 Attendance Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse border border-gray-200 rounded-lg">
          <thead className="bg-blue-100 text-blue-800 text-center">
            <tr>
              <th className="p-3 border-b">Student Name</th>
              <th className="p-3 border-b">Roll No</th>
              <th className="p-3 border-b">Class Time</th>
              <th className="p-3 border-b">Teacher</th>
              <th className="p-3 border-b">Status</th>
              <th className="p-3 border-b">Date</th>
              <th className="p-3 border-b text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {attendanceList.length ? (
              attendanceList.map((a) => (
                <tr key={a.id} className="hover:bg-gray-50 transition text-center">
                  <td className="p-3">{a.student_name}</td>
                  <td className="p-3">{a.roll_no}</td>
                  <td className="p-3">{a.class_time}</td>
                  <td className="p-3">{a.teacher_name}</td>
                  <td className="p-3">{a.status}</td>
                  <td className="p-3">{a.date}</td>
                  <td className="p-3 text-center">
                    <Button
                      size="sm"
                      variant="destructive"
                      className="bg-red-600 hover:bg-red-700 text-white"
                      onClick={() => handleDelete(a.id)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="text-center p-4 text-gray-500">
                  No attendance records found for selected month.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
