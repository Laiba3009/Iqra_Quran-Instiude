'use client';

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";

interface Teacher {
  id: string;
  name: string;
  roll_no: string;
}

interface LeaveRequest {
  id: string;
  reason: string;
  status: string;
  created_at: string;
}

export default function TeacherLeaveRequestPage() {
  const [reason, setReason] = useState("");
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    const loadTeacher = async () => {
      const rollNo = localStorage.getItem("teacher_roll_no");

      if (!rollNo) {
        toast({
          title: "Error",
          description: "Please login again.",
        });
        return;
      }

      const { data } = await supabase
        .from("teachers")
        .select("id, name, roll_no")
        .eq("roll_no", rollNo)
        .maybeSingle();

      if (data) {
        setTeacher(data);
        loadLeaveRequests(data.id);
      }

      setLoading(false);
    };

    loadTeacher();
  }, []);

  // ✅ Fetch leave requests
  const loadLeaveRequests = async (teacherId: string) => {
    const { data } = await supabase
      .from("teacher_leave")
      .select("*")
      .eq("teacher_id", teacherId)
      .order("created_at", { ascending: false });

    if (data) setLeaveRequests(data);
  };

  const handleSubmit = async () => {
    if (!reason.trim() || !teacher) return;

    const { error } = await supabase.from("teacher_leave").insert([
      {
        teacher_id: teacher.id,
        teacher_name: teacher.name,
        reason: reason.trim(),
        status: "pending",
      },
    ]);

    if (!error) {
      toast({
        title: "Sent ✅",
        description: "Leave request sent.",
      });
      setReason("");
      loadLeaveRequests(teacher.id); // refresh list
    }
  };

  return (
    <div className="p-6 max-w-md mt-16 mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-center">
        Leave Request
      </h1>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <Textarea
            placeholder="Enter your reason..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="mb-4"
          />

          <Button
            onClick={handleSubmit}
            className="bg-blue-600 text-white w-full mb-6"
          >
            Send Leave Request
          </Button>

          <h2 className="text-xl font-bold mb-2">My Requests</h2>

          {leaveRequests.length === 0 ? (
            <p>No requests yet.</p>
          ) : (
            <ul>
              {leaveRequests.map((req) => (
                <li
                  key={req.id}
                  className="border p-3 mb-2 rounded"
                >
                  <p><strong>Reason:</strong> {req.reason}</p>
                  <p>
                    <strong>Status:</strong>{" "}
                    <span
                      className={
                        req.status === "approved"
                          ? "text-green-600"
                          : req.status === "rejected"
                          ? "text-red-600"
                          : "text-yellow-600"
                      }
                    >
                      {req.status}
                    </span>
                  </p>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
