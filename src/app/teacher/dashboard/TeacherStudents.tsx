'use client';

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";

interface TeacherStudentsProps {
  teacherId: string;
}

interface Student {
  id: string; // UUID
  name: string;
  roll_no: string;
  teacher_ids: string[];
}

export default function TeacherStudents({ teacherId }: TeacherStudentsProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [progressReports, setProgressReports] = useState<{ [key: string]: string }>({});
  const { toast } = useToast();

  // Load students assigned to this teacher
  useEffect(() => {
    if (teacherId) loadStudents();
  }, [teacherId]);

  const loadStudents = async () => {
    const { data, error } = await supabase
      .from("students")
      .select("id, name, roll_no, teacher_ids")
      .contains("teacher_ids", [teacherId]); // teacher_ids is UUID[]

    if (error) {
      console.error("Error fetching students:", error);
      toast({
        title: "Error",
        description: "Failed to load students.",
        variant: "destructive",
      });
    } else {
      // Ensure student.id is string (UUID)
      const studentsWithStringId = (data || []).map((s: any) => ({
        ...s,
        id: s.id.toString(),
      }));
      setStudents(studentsWithStringId);
    }
  };

  // Handle progress report save
  const handleSaveReport = async (studentId: string) => {
    const text = progressReports[studentId];
    if (!text?.trim()) {
      toast({
        title: "Empty Report ❌",
        description: "Please write something before saving.",
        variant: "destructive",
      });
      return;
    }

    const { error } = await supabase.from("student_progress").insert({
      student_id: studentId, // UUID
      teacher_id: teacherId,  // UUID
      report_text: text,
    });

    if (error) {
      console.error(error);
      toast({
        title: "Save Failed ❌",
        description: error.message || "Couldn't save progress report.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Saved ✅",
        description: "Progress report added successfully!",
      });
      setProgressReports((prev) => ({ ...prev, [studentId]: "" }));
    }
  };

  if (students.length === 0) {
    return (
      <p className="text-gray-500 text-center">
        No students assigned to you yet.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {students.map((student) => (
        <Card key={student.id} className="border shadow-md">
          <CardHeader>
            <CardTitle className="text-lg text-green-800">
              🎓 {student.name}
            </CardTitle>
            <p className="text-sm text-gray-600">Roll No: {student.roll_no}</p>
          </CardHeader>

          <CardContent>
            <Textarea
              placeholder="Write today's progress report..."
              value={progressReports[student.id] || ""}
              onChange={(e) =>
                setProgressReports((prev) => ({
                  ...prev,
                  [student.id]: e.target.value,
                }))
              }
              className="mb-3"
            />
            <Button
              onClick={() => handleSaveReport(student.id)}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Save Progress Report
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
