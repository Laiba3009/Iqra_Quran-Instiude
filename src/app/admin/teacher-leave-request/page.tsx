"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";

interface LeaveRequest {
  id: string;
  teacher_name: string;
  leave_date: string;
  reason: string;
  status: string;
}

export default function AdminLeave() {
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ LOAD DATA
  useEffect(() => {
    loadData();

    // ✅ REALTIME UPDATE
    const channel = supabase
      .channel("teacher_leave_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "teacher_leave",
        },
        () => {
          loadData();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // ✅ FETCH REQUESTS
  const loadData = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("teacher_leave")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.log("LOAD ERROR:", error);
    } else {
      setLeaveRequests(data || []);
    }

    setLoading(false);
  };

  // ✅ APPROVE
  const handleApprove = async (id: string) => {
    const { error } = await supabase
      .from("teacher_leave")
      .update({ status: "approved" })
      .eq("id", id);

    if (error) {
      console.log("APPROVE ERROR:", error);
      return;
    }

    // refresh
    loadData();
  };

  // ❌ CANCEL
  const handleCancel = async (id: string) => {
    const { error } = await supabase
      .from("teacher_leave")
      .update({ status: "cancelled" })
      .eq("id", id);

    if (error) {
      console.log("CANCEL ERROR:", error);
      return;
    }

    // refresh
    loadData();
  };

  // 🗑 DELETE
  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this request?"
    );

    if (!confirmDelete) return;

    const { error } = await supabase
      .from("teacher_leave")
      .delete()
      .eq("id", id);

    if (error) {
      console.log("DELETE ERROR:", error);
      alert(error.message);
      return;
    }

    // ✅ REMOVE FROM UI
    setLeaveRequests((prev) =>
      prev.filter((item) => item.id !== id)
    );

    // ✅ RELOAD DATABASE DATA
    loadData();
  };

  // 🎨 STATUS COLORS
  const statusColor = (status: string) => {
    const s = status?.toLowerCase();

    if (s === "approved") return "text-green-600";
    if (s === "cancelled") return "text-gray-500";
    if (s === "pending") return "text-yellow-600";

    return "text-red-600";
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">

      {/* TITLE */}
      <h1 className="text-3xl font-bold text-center mt-6 mb-8">
        Teacher Leave Requests
      </h1>

      {/* LOADING */}
      {loading ? (
        <div className="text-center text-lg font-semibold">
          Loading...
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-xl shadow-lg overflow-hidden">

            {/* TABLE HEADER */}
            <thead className="bg-gray-800 text-white">
              <tr>
                <th className="p-4">Teacher</th>
                <th className="p-4">Date</th>
                <th className="p-4">Reason</th>
                <th className="p-4">Status</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>

            {/* TABLE BODY */}
            <tbody>

              {leaveRequests.map((leave) => (
                <tr
                  key={leave.id}
                  className="border-b text-center hover:bg-gray-50 transition"
                >

                  {/* TEACHER */}
                  <td className="p-4 font-medium">
                    {leave.teacher_name}
                  </td>

                  {/* DATE */}
                  <td className="p-4">
                    {leave.leave_date
                      ? new Date(
                          leave.leave_date
                        ).toLocaleDateString()
                      : "-"}
                  </td>

                  {/* REASON */}
                  <td className="p-4 max-w-xs break-words">
                    {leave.reason}
                  </td>

                  {/* STATUS */}
                  <td
                    className={`p-4 font-bold ${statusColor(
                      leave.status
                    )}`}
                  >
                    {leave.status || "pending"}
                  </td>

                  {/* ACTIONS */}
                  <td className="p-4">
                    <div className="flex flex-wrap justify-center gap-2">

                      {/* APPROVE */}
                      {leave.status?.toLowerCase() !== "approved" && (
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white"
                          onClick={() =>
                            handleApprove(leave.id)
                          }
                        >
                          Approve
                        </Button>
                      )}

                      {/* CANCEL */}
                      {leave.status?.toLowerCase() !== "cancelled" && (
                        <Button
                          size="sm"
                          className="bg-gray-600 hover:bg-gray-700 text-white"
                          onClick={() =>
                            handleCancel(leave.id)
                          }
                        >
                          Cancel
                        </Button>
                      )}

                      {/* DELETE */}
                      <Button
                        size="sm"
                        className="bg-red-600 hover:bg-red-700 text-white"
                        onClick={() =>
                          handleDelete(leave.id)
                        }
                      >
                        Delete
                      </Button>

                    </div>
                  </td>
                </tr>
              ))}

              {/* EMPTY */}
              {leaveRequests.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="p-6 text-center text-gray-500"
                  >
                    No leave requests found
                  </td>
                </tr>
              )}

            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}