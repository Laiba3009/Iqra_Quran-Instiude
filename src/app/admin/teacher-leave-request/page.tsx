'use client';

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";

interface LeaveRequest {
  id: string;
  leave_date: string;
  reason: string;
  status: string;
}

export default function TeacherLeaveRequest({ teacherId, teacherName }: { teacherId: string; teacherName: string }) {
  const [leaveDate, setLeaveDate] = useState("");
  const [reason, setReason] = useState("");
  const [myRequests, setMyRequests] = useState<LeaveRequest[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadMyRequests();
  }, []);

  const loadMyRequests = async () => {
    const { data, error } = await supabase
      .from("teacher_leave")
      .select("id, leave_date, reason, status")
      .eq("teacher_id", teacherId)
      .order("leave_date", { ascending: false });

    if (error) {
      toast({ title: "Error", description: "Failed to load your leave requests." });
      return;
    }

    setMyRequests(data || []);
  };

  const handleRequestLeave = async () => {
    if (!leaveDate || !reason.trim()) {
      toast({ title: "Error", description: "Select a date and enter a reason." });
      return;
    }
const { error } = await supabase.from("teacher_leave").insert([
  {
    teacher_id: teacherId,          // UUID string
    teacher_name: teacherName,      // text
    leave_date: leaveDate,          // 'YYYY-MM-DD'
    reason,
    status: "Pending",
  },
]);


    if (error) {
      toast({ title: "Error", description: "Failed to request leave." });
    } else {
      toast({ title: "✅ Leave Requested", description: "Your request is sent to admin." });
      setLeaveDate("");
      setReason("");
      loadMyRequests(); // Refresh list
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white rounded-xl border shadow-md">
      <h1 className="text-2xl font-bold mb-4 text-center">Request Leave</h1>

      {/* Leave Request Form */}
      <div className="mb-6">
        <label className="block font-medium mb-1">Leave Date:</label>
        <input
          type="date"
          value={leaveDate}
          onChange={(e) => setLeaveDate(e.target.value)}
          className="border p-2 rounded w-full"
        />

        <label className="block font-medium mb-1 mt-3">Reason:</label>
        <Textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Enter reason for leave..."
          className="w-full"
        />

        <Button
          className="bg-blue-600 hover:bg-blue-700 text-white mt-3 w-full"
          onClick={handleRequestLeave}
        >
          Request Leave
        </Button>
      </div>

      {/* My Leave Requests Table */}
      <div className="overflow-x-auto">
        <h2 className="text-lg font-semibold mb-2">My Leave Requests</h2>
        <table className="min-w-full border border-gray-200 rounded-lg">
          <thead className="bg-gray-100 text-gray-800 text-center">
            <tr>
              <th className="p-3 border-b">Date</th>
              <th className="p-3 border-b">Reason</th>
              <th className="p-3 border-b">Status</th>
            </tr>
          </thead>
          <tbody>
            {myRequests.length ? (
              myRequests.map((l) => (
                <tr key={l.id} className="hover:bg-gray-50 text-center">
                  <td className="p-3">{l.leave_date}</td>
                  <td className="p-3">{l.reason}</td>
                  <td className="p-3 font-semibold">{l.status}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="text-center p-4 text-gray-500">
                  No leave requests submitted yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
