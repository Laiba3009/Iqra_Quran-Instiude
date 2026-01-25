"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface CancelRequest {
  id: string;
  student_name: string;
  student_roll: string;
  teacher_id: string;
  teacher_name: string;
  day: string;
  time: string;
  subject: string;
  reason: string;
  created_at: string;
}

export default function CancelledClassesTeacherPage() {
  const [requests, setRequests] = useState<CancelRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCancelledRequests();
  }, []);

  // ================= LOAD ONLY CURRENT TEACHER DATA =================
  const loadCancelledRequests = async () => {
    setLoading(true);

    try {
      // 🔐 teacher_id jo login pe save hua tha
      const teacherId = localStorage.getItem("teacher_id");

      if (!teacherId) {
        console.warn("Teacher ID not found in localStorage");
        setRequests([]);
        return;
      }

      // ✅ sirf isi teacher ke cancelled students
      const { data, error } = await supabase
        .from("class_cancellations")
        .select("*")
        .eq("teacher_id", teacherId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setRequests(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // ================= DELETE REQUEST =================
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this cancellation request?"))
      return;

    try {
      const { error } = await supabase
        .from("class_cancellations")
        .delete()
        .eq("id", id);

      if (error) throw error;

      // UI se turant remove
      setRequests((prev) => prev.filter((r) => r.id !== id));

      alert("Cancellation request deleted successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to delete the request.");
    }
  };

  if (loading)
    return (
      <p className="text-center mt-10">
        Loading cancelled requests...
      </p>
    );

  return (
    <div className="max-w-5xl mx-auto mt-20 p-6 space-y-6">
      <h1 className="text-3xl font-bold text-green-800 text-center">
        🛑 Cancelled Classes Requests
      </h1>

      {requests.length === 0 ? (
        <p className="text-center text-gray-600">
          Is teacher ke liye koi cancellation request nahi hai.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {requests.map((req) => (
            <Card
              key={req.id}
              className="shadow-md border border-red-200"
            >
              <CardContent className="p-4 space-y-2">
                <h2 className="text-xl font-semibold text-red-700">
                  {req.subject}
                </h2>

                <p>
                  <b>Student:</b> {req.student_name} (
                  {req.student_roll})
                </p>

                <p>
                  <b>Day:</b> {req.day}
                </p>

                <p>
                  <b>Time:</b> {req.time}
                </p>
<p><b>Reason:</b> Today Class Cancel</p>



                <p className="text-sm text-gray-500">
                  Requested on:{" "}
                  {new Date(req.created_at).toLocaleString()}
                </p>

                <Button
                  className="bg-red-600 hover:bg-red-700 text-white mt-3 w-full"
                  onClick={() => handleDelete(req.id)}
                >
                  Delete
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
