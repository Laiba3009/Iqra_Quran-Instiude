"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import BackButton from "@/components/ui/BackButton";

export default function ComplaintsList() {
  const [complaints, setComplaints] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadComplaints();
  }, []);

  const loadComplaints = async () => {
    const { data, error } = await supabase
      .from("complaints")
      .select("id, complaint, created_at, students(name, roll_no)")
      .order("id", { ascending: false });

    if (error) {
      toast({ title: "Error", description: error.message });
    } else {
      setComplaints(data || []);
    }
  };

  const deleteComplaint = async (id: number) => {
    const { error } = await supabase.from("complaints").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message });
    } else {
      toast({ title: "Deleted", description: "Complaint removed successfully." });
      setComplaints(complaints.filter((c) => c.id !== id));
    }
  };

  return (
    <Card className="w-full">
      <BackButton href="/admin/dashboard" label="Back to Dashboard" />
      
      <CardHeader>
        <CardTitle>Complaints</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="p-3 border">Student</th>
                <th className="p-3 border">Roll No</th>
                <th className="p-3 border">Complaint</th>
                <th className="p-3 border">Date</th>
                <th className="p-3 border">Action</th>
              </tr>
            </thead>
            <tbody>
              {complaints.length > 0 ? (
                complaints.map((c) => (
                  <tr key={c.id} className="border-t hover:bg-gray-50">
                    <td className="p-3 border">{c.students?.name || "Unknown"}</td>
                    <td className="p-3 border">{c.students?.roll_no || "-"}</td>
                    <td className="p-3 border">{c.complaint}</td>
                    <td className="p-3 border">
                      {new Date(c.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-3 border">
                      <Button
                        className="bg-red-600 hover:bg-red-700 text-white"
                        size="sm"
                        onClick={() => deleteComplaint(c.id)}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center p-3 text-gray-500">
                    No complaints found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
