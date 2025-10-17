'use client';

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import BackButton from "@/components/ui/BackButton";

interface CancelReason {
  id: number;
  reason: string;
  created_at: string;
  student_id: string;
  student?: { name: string; roll_no: string };
}

export default function CancelReasonsList() {
  const [reasons, setReasons] = useState<CancelReason[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadReasons();
  }, []);

  const loadReasons = async () => {
    // Fetch only student details and reason
    const { data, error } = await supabase
      .from("cancel_reasons")
      .select(`
        id,
        reason,
        created_at,
        student_id,
        students(name, roll_no)
      `)
      .order("id", { ascending: false });

    if (error) {
      toast({ title: "Error", description: error.message });
    } else {
      setReasons(data || []);
    }
  };

  const deleteReason = async (id: number) => {
    const { error } = await supabase.from("cancel_reasons").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message });
    } else {
      toast({ title: "Deleted", description: "Reason removed successfully." });
      setReasons(reasons.filter((r) => r.id !== id));
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-12 space-y-8">
      {/* Back Button */}
      <div>
        <BackButton href="/admin/dashboard" label="Back to Dashboard" />
      </div>
      <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-center text-gray-800 mb-6">
        📝 Student Reasons Cancel Class
      </h1>
      {/* Cancel Reasons Table */}
      <Card className="w-full">
        
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead className="bg-green-700 text-white text-left">
                <tr>
                  <th className="p-3 border">Student</th>
                  <th className="p-3 border">Roll No</th>
                  <th className="p-3 border">Reason</th>
                  <th className="p-3 border">Date</th>
                  <th className="p-3 border">Action</th>
                </tr>
              </thead>
              <tbody>
                {reasons.length > 0 ? (
                  reasons.map((r) => (
                    <tr key={r.id} className="border-t hover:bg-gray-50">
                      <td className="p-3 border">{r.students?.name || "Unknown"}</td>
                      <td className="p-3 border">{r.students?.roll_no || "-"}</td>
                      <td className="p-3 border">{r.reason}</td>
                      <td className="p-3 border">
                        {new Date(r.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-3 border">
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
