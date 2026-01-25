"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button"; // optional, agar tum button component use kar rahi ho

export default function AdminCancelledClasses() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // ---------------- FETCH DATA ----------------
  const loadData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("class_cancellations")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setData(data || []);
    } catch (err) {
      console.error(err);
      alert("Failed to load cancelled classes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // ---------------- DELETE ----------------
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this cancelled class?")) return;

    try {
      const { error } = await supabase
        .from("class_cancellations")
        .delete()
        .eq("id", id);

      if (error) throw error;

      // Remove from UI immediately
      setData((prev) => prev.filter((c) => c.id !== id));
      alert("Cancelled class deleted successfully!");
    } catch (err) {
      console.error(err);
      alert("Failed to delete cancelled class");
    }
  };

  if (loading) return <p className="text-center mt-10">Loading cancelled classes...</p>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
 <h1 className="text-3xl font-bold text-green-800 m-16 text-center">
        🛑 Cancelled Classes Requests
      </h1>

      {data.length === 0 ? (
        <p className="text-center text-gray-600">No cancelled classes found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.map((c) => (
            <div key={c.id} className="border p-4 rounded shadow relative">
              <p><b>Student:</b> {c.student_name}</p>
              <p><b>Teacher:</b> {c.teacher_name}</p>
              <p><b>Subject:</b> {c.subject}</p>
              <p><b>Time:</b> {c.day} {c.time}</p>
              <p className="text-red-700"><b>Reason:</b> {c.reason}</p>

              <button
                onClick={() => handleDelete(c.id)}
                className="absolute top-2 right-2 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded transition"
              >
                ❌ Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
