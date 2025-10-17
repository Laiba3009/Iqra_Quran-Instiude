'use client';

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import BackButton from "@/components/ui/BackButton";

interface Complaint {
  id: number;
  complaint: string;
  created_at: string;
  student_roll: string;
  student_name?: string;
}

export default function ComplaintsList() {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [studentsMap, setStudentsMap] = useState<Record<string, string>>({});
  const { toast } = useToast();

  useEffect(() => {
    loadStudents();
  }, []);

  useEffect(() => {
    if (Object.keys(studentsMap).length > 0) {
      loadComplaints();
    }
  }, [studentsMap]);

  const loadStudents = async () => {
    const { data: students, error } = await supabase
      .from("students")
      .select("roll_no, name");

    if (error) {
      toast({ title: "Error", description: error.message });
      return;
    }

    const map: Record<string, string> = {};
    students?.forEach((s: any) => {
      map[s.roll_no] = s.name;
    });

    setStudentsMap(map);
  };

  const loadComplaints = async () => {
    const { data, error } = await supabase
      .from("complaints")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      toast({ title: "Error", description: error.message });
      return;
    }

    const mapped = (data || []).map((c: any) => ({
      ...c,
      student_name: studentsMap[c.student_roll] || "Unknown",
    }));

    setComplaints(mapped);
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
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-12 space-y-8">
      {/* Back Button */}
      <div>
        <BackButton href="/admin/dashboard" label="Back to Dashboard" />
      </div>

      {/* Page Title */}
      <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-center text-gray-800 mb-6">
        📝 Student Complaints
      </h1>

      {/* Complaints Table Card */}
      <Card className="w-full">
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse">
              <thead className="bg-green-700 text-white text-left">
                <tr>
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
                      <td className="p-3 border">{c.student_name}</td>
                      <td className="p-3 border">{c.student_roll}</td>
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
    </div>
  );
}
