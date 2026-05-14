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
      try {
        const rollNo = localStorage.getItem("teacher_roll_no");

        if (!rollNo) {
          toast({
            title: "Error ❌",
            description: "Please login again.",
          });

          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from("teachers")
          .select("id, name, roll_no")
          .eq("roll_no", rollNo)
          .maybeSingle();

        if (error) {
          console.log("Teacher Fetch Error:", error);

          toast({
            title: "Error ❌",
            description: error.message,
          });

          setLoading(false);
          return;
        }

        if (data) {
          setTeacher(data);

          // ✅ Load previous leave requests
          await loadLeaveRequests(data.id);
        } else {
          toast({
            title: "Error ❌",
            description: "Teacher not found.",
          });
        }
      } catch (err) {
        console.log(err);

        toast({
          title: "Error ❌",
          description: "Something went wrong.",
        });
      } finally {
        setLoading(false);
      }
    };

    loadTeacher();
  }, []);

  // ✅ Fetch Leave Requests
  const loadLeaveRequests = async (teacherId: string) => {
    const { data, error } = await supabase
      .from("teacher_leave")
      .select("*")
      .eq("teacher_id", teacherId)
      .order("created_at", { ascending: false });

    if (error) {
      console.log("Leave Fetch Error:", error);
      return;
    }

    if (data) {
      setLeaveRequests(data);
    }
  };

  // ✅ Submit Leave Request
  const handleSubmit = async () => {
    if (!reason.trim()) {
      toast({
        title: "Error ❌",
        description: "Please enter reason.",
      });
      return;
    }

    if (!teacher) {
      toast({
        title: "Error ❌",
        description: "Teacher not found. Login again.",
      });
      return;
    }

    const { error } = await supabase
      .from("teacher_leave")
      .insert([
        {
          teacher_id: teacher.id,
          teacher_name: teacher.name,
          reason: reason.trim(),
          status: "pending",
        },
      ]);

    if (error) {
      console.log("INSERT ERROR:", error);

      toast({
        title: "Error ❌",
        description: error.message,
      });

      return;
    }

    // ✅ Success
    toast({
      title: "Sent ✅",
      description: "Leave request sent successfully.",
    });

    setReason("");

    // ✅ Refresh list
    await loadLeaveRequests(teacher.id);
  };

  return (
    <div className="p-6 max-w-md mt-16 mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-center">
        Leave Request
      </h1>

      {loading ? (
        <p className="text-center">Loading...</p>
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
            className="bg-blue-600 hover:bg-blue-700 text-white w-full mb-6"
          >
            Send Leave Request
          </Button>

          <h2 className="text-xl font-bold mb-2">
            My Requests
          </h2>

          {leaveRequests.length === 0 ? (
            <p>No requests yet.</p>
          ) : (
            <ul>
              {leaveRequests.map((req) => (
                <li
                  key={req.id}
                  className="border p-3 mb-2 rounded-lg shadow-sm"
                >
                  <p>
                    <strong>Reason:</strong> {req.reason}
                  </p>

                  <p>
                    <strong>Status:</strong>{" "}
                    <span
                      className={
                        req.status === "approved"
                          ? "text-green-600 font-semibold"
                          : req.status === "rejected"
                          ? "text-red-600 font-semibold"
                          : "text-yellow-600 font-semibold"
                      }
                    >
                      {req.status}
                    </span>
                  </p>

                  <p className="text-sm text-gray-500 mt-1">
                    {new Date(req.created_at).toLocaleString()}
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