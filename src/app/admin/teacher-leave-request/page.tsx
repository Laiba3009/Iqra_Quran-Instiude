'use client';

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

interface LeaveRequest {
  id: string;
  teacher_id: string;
  teacher_name: string;
  leave_date: string;
  reason: string;
  status: string;
  created_at?: string;
}

export default function AdminLeave() {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadLeaveRequests();
  }, []);

  const loadLeaveRequests = async () => {
    const { data, error } = await supabase
      .from("teacher_leave")
      .select("id, teacher_id, teacher_name, reason, leave_date, status, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Load Error:", error);
      toast({ title: "Error", description: "Failed to load leave requests." });
      return;
    }

    setLeaveRequests(data || []);
  };

  const handleUpdateStatus = async (id: string, status: "Approved" | "Cancelled") => {
    const { error: updateError } = await supabase
      .from("teacher_leave")
      .update({ status })
      .eq("id", id);

    if (updateError) {
      toast({ title: "Error", description: "Failed to update status." });
      return;
    }

    const updatedLeave = leaveRequests.find(l => l.id === id);
    if (!updatedLeave) return;

    const message =
      status === "Approved"
        ? `Your leave for ${new Date(updatedLeave.leave_date).toLocaleDateString()} has been approved ✅`
        : `Your leave for ${new Date(updatedLeave.leave_date).toLocaleDateString()} has been cancelled ❌`;

    const { error: notifError } = await supabase.from("teacher_notifications").insert([
      {
        teacher_id: updatedLeave.teacher_id,
        message,
        read: false,
      },
    ]);

    if (notifError) {
      console.error("Notification Error:", notifError);
      toast({ title: "Error", description: "Failed to send notification to teacher." });
    } else {
      toast({ title: `Leave ${status}`, description: "Teacher has been notified." });
    }

    setLeaveRequests(prev => prev.map(l => (l.id === id ? { ...l, status } : l)));
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("teacher_leave").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: "Failed to delete leave request." });
    } else {
      toast({ title: "Deleted", description: "Leave request has been deleted." });
      setLeaveRequests(prev => prev.filter(l => l.id !== id));
    }
  };

  return (
    <div className="p-6">
      <Button
        onClick={() => history.back()}
        className="mb-4 bg-blue-800 hover:bg-blue-700 text-white"
      >
        Back
      </Button>

      <h1 className="text-2xl font-bold mb-4 text-center">Teacher Leave Requests</h1>

      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 rounded-lg">
          <thead className="bg-blue-800 text-white text-center">
            <tr>
              <th className="p-3 border-b">Teacher</th>
              <th className="p-3 border-b">Date</th>
              <th className="p-3 border-b">Reason</th>
              <th className="p-3 border-b">Status</th>
              <th className="p-3 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {leaveRequests.length ? (
              leaveRequests.map(l => (
                <tr key={l.id} className="hover:bg-gray-50 text-center">
                  <td className="p-3">{l.teacher_name}</td>
                  <td className="p-3">
                    {l.leave_date ? new Date(l.leave_date).toLocaleDateString() : "—"}
                  </td>
                  <td className="p-3">{l.reason}</td>
                  <td className="p-3 font-semibold">{l.status}</td>
                  <td className="p-3 flex justify-center gap-2 flex-wrap">
                    {l.status === "Pending" && (
                      <>
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => handleUpdateStatus(l.id, "Approved")}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          className="bg-gray-600 hover:bg-gray-700  text-white"
                          onClick={() => handleUpdateStatus(l.id, "Cancelled")}
                        >
                          Cancel
                        </Button>
                      </>
                    )}
                    <Button
                      size="sm"
                      className=" bg-red-600 hover:bg-red-700 text-white"
                      onClick={() => handleDelete(l.id)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="text-center p-4 text-gray-500">
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
