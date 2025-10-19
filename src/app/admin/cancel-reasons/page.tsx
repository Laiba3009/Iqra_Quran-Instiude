'use client';

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import BackButton from "@/components/ui/BackButton";

interface CancelReason {
  id: number;
  reason: string;
  created_at?: string;
  student_name: string | null;
  student_roll: string | null;
}

export default function CancelReasonsList() {
  const [reasons, setReasons] = useState<CancelReason[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadReasons();
  }, []);

  const loadReasons = async () => {
    // ✅ Fetch all columns safely
    const { data, error } = await supabase
      .from("cancel_reasons")
      .select(`
        id,
        reason,
        student_name,
        student_roll,
        created_at
      `)
      .order("id", { ascending: false });

    if (error) {
      console.error("Load error:", error);
      toast({ title: "Error loading data", description: error.message });
    } else {
      console.log("Loaded data:", data);
      setReasons(data || []);
    }
  };

  const deleteReason = async (id: number) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this reason?");
    if (!confirmDelete) return;

    const { error } = await supabase.from("cancel_reasons").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message });
    } else {
      toast({ title: "Deleted", description: "Reason removed successfully." });
      setReasons((prev) => prev.filter((r) => r.id !== id));
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-12 space-y-8">
      <div>
        <BackButton href="/admin/dashboard" label="Back to Dashboard" />
      </div>

      <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
        📝 Student Cancel Class Reasons
      </h1>

      <Card className="w-full">
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead className="bg-green-700 text-white text-left">
                <tr>
                  <th className="p-3 border">Student Name</th>
                  <th className="p-3 border">Roll No</th>
                  <th className="p-3 border">Reason</th>
                  <th className="p-3 border">Date</th>
                  <th className="p-3 border text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {reasons.length > 0 ? (
                  reasons.map((r) => (
                    <tr key={r.id} className="border-t hover:bg-gray-50 transition">
                      <td className="p-3 border">{r.student_name ?? "Unknown"}</td>
                      <td className="p-3 border">{r.student_roll ?? "-"}</td>
                      <td className="p-3 border">{r.reason}</td>
                      <td className="p-3 border">
                        {r.created_at
                          ? new Date(r.created_at).toLocaleDateString()
                          : "-"}
                      </td>
                      <td className="p-3 border text-center">
                        <Button
                          className="bg-red-600 hover:bg-red-700 text-white"
                          size="sm"
                          onClick={() => deleteReason(r.id)}
                        >
                          Delete
                        </Button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center p-3 text-gray-500">
                      No reasons found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
