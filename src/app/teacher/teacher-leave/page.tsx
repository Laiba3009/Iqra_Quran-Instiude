'use client';

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";

interface LeaveRequest {
  id: string;
  teacher_id: string;
  teacher_name: string;
  leave_date: string;
  reason: string;
  status: string;
}

export default function TeacherLeave() {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [reason, setReason] = useState("");
  const { toast } = useToast();

  const teacherId = getCookie("teacher_id");
  const teacherName = getCookie("teacher_name");

  useEffect(() => {
    if (teacherId) loadLeaveRequests();
  }, [teacherId]);

  const loadLeaveRequests = async () => {
    const { data, error } = await supabase
      .from("teacher_leave")
      .select("*")
      .eq("teacher_id", teacherId)
      .order("leave_date", { ascending: false });

    if (error) {
      toast({ title: "Error", description: "Failed to load leave requests." });
      return;
    }

    setLeaveRequests(data || []);
  };

  const handleRequestLeave = async () => {
    if (!reason.trim()) {
      toast({ title: "Error", description: "Please enter reason." });
      return;
    }

    const leave_date = new Date().toISOString().split("T")[0];

    const { error } = await supabase.from("teacher_leave").insert([
      {
        teacher_id: teacherId,
        teacher_name: teacherName,
        leave_date,
        reason,
        status: "Pending",
      },
    ]);

    if (error) {
      toast({ title: "Error", description: "Failed to request leave." });
    } else {
      toast({ title: "✅ Leave Requested" });
      setReason("");
      loadLeaveRequests();
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4 text-center">Request Leave</h1>

      <div className="mb-4">
        <Textarea
          placeholder="Write reason for leave..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          className="mb-2"
        />
        <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleRequestLeave}>
          Submit Leave Request
        </Button>
      </div>

      <h2 className="text-xl font-semibold mb-2 mt-6 text-center">My Leave Requests</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 rounded-lg">
          <thead className="bg-gray-100 text-gray-800 text-center">
            <tr>
              <th className="p-3 border-b">Date</th>
              <th className="p-3 border-b">Reason</th>
              <th className="p-3 border-b">Status</th>
            </tr>
          </thead>
          <tbody>
            {leaveRequests.length ? (
              leaveRequests.map((l) => (
                <tr key={l.id} className="hover:bg-gray-50 text-center">
                  <td className="p-3">{l.leave_date}</td>
                  <td className="p-3">{l.reason}</td>
                  <td className="p-3 font-semibold">{l.status}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="text-center p-4 text-gray-500">
                  No leave requests found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Helper function to get cookie
function getCookie(name: string) {
  return document.cookie.split(";").reduce((r, v) => {
    const parts = v.split("=");
    return parts[0].trim() === name ? decodeURIComponent(parts[1]) : r;
  }, "");
}
