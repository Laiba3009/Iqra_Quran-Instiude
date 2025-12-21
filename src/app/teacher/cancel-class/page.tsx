"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface CancelRequest {
  id: string;
  student_name: string;
  student_roll: string;
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

  const loadCancelledRequests = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("class_cancellations")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      if (data) setRequests(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /* ================= DELETE REQUEST ================= */
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this cancellation request?")) return;

    try {
      const { error } = await supabase
        .from("class_cancellations")
        .delete()
        .eq("id", id);

      if (error) throw error;

      // Remove from UI immediately
      setRequests((prev) => prev.filter((req) => req.id !== id));
      alert("Cancellation request deleted successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to delete the request.");
    }
  };

  if (loading) return <p className="text-center mt-10">Loading cancelled requests...</p>;

  return (
    <div className="max-w-5xl mx-auto mt-20 p-6 space-y-6">
      <h1 className="text-3xl font-bold text-green-800 text-center">🛑 Cancelled Classes Requests</h1>

      {requests.length === 0 ? (
        <p className="text-center text-gray-600">No cancellation requests found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {requests.map((req) => (
            <Card key={req.id} className="shadow-md border-red-200">
              <CardContent className="p-4 space-y-2">
                <h2 className="text-xl font-semibold text-red-700">{req.subject}</h2>
                <p><b>Student:</b> {req.student_name} ({req.student_roll})</p>
                <p><b>Teacher:</b> {req.teacher_name}</p>
                <p><b>Day:</b> {req.day}</p>
                  <p>    <b>Subject{req.subject.includes(',') ? 's' : ''}:</b> {req.subject}</p>
                <p><b>Time:</b> {req.time}</p>
                <p><b>Reason:</b> {req.reason}</p>
                <p className="text-sm text-gray-500">Requested on: {new Date(req.created_at).toLocaleString()}</p>

                <Button
                  className="bg-red-600 hover:bg-red-700 text-white mt-2"
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
