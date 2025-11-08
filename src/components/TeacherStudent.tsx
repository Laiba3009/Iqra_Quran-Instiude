'use client';

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";

interface TeacherStudentsProps {
  teacherId: string;
}

interface Student {
  id: string;
  name: string;
  roll_no: string;
  syllabus: string[] | null;
  class_time: string | null;
}

export default function TeacherStudents({ teacherId }: TeacherStudentsProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [teacherName, setTeacherName] = useState<string>("Unknown");
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [showComplaintModal, setShowComplaintModal] = useState(false);
  const [progressText, setProgressText] = useState("");
  const [complaintText, setComplaintText] = useState("");
  const [attendance, setAttendance] = useState<{ [key: string]: string }>({});
  const { toast } = useToast();

  // 🔹 Load teacher name
  useEffect(() => {
    const loadTeacher = async () => {
      const { data } = await supabase
        .from("teachers")
        .select("name")
        .eq("id", teacherId)
        .maybeSingle();
      if (data?.name) setTeacherName(data.name);
    };
    loadTeacher();
  }, [teacherId]);

  // 🔹 Load Assigned Students
  useEffect(() => {
    if (teacherId) loadStudents();
  }, [teacherId]);

  const loadStudents = async () => {
    const { data, error } = await supabase
      .from("student_teachers")
      .select("students(id, name, roll_no, syllabus, class_time)")
      .eq("teacher_id", teacherId);

    if (error) {
      console.error(error);
      toast({ title: "Error", description: "Failed to load students." });
      return;
    }

    const parsed = (data || []).reduce<Student[]>((acc, d) => {
      const s = d.students;
      if (!s) return acc;
      if (Array.isArray(s)) return acc.concat(s);
      acc.push(s);
      return acc;
    }, []);

    setStudents(parsed);

    // Initialize attendance state
    const initialAttendance: { [key: string]: string } = {};
    parsed.forEach((s) => (initialAttendance[s.id] = ""));
    setAttendance(initialAttendance);
  };

  // 🔹 Save Attendance (tsattendance table)
const handleAttendance = async (student: Student, status: "present" | "absent") => {
  if (!teacherId) return;

  // Local date format YYYY-MM-DD
  const today = new Date();
  const date = today.getFullYear() + "-" + 
               String(today.getMonth() + 1).padStart(2, '0') + "-" + 
               String(today.getDate()).padStart(2, '0');

  setAttendance((prev) => ({ ...prev, [student.id]: status }));

  const { error } = await supabase.from("tsattendance").insert([
    {
      student_id: student.id,
      teacher_id: teacherId,
      date,
      status,
    },
  ]);

  if (error) {
    console.error("Attendance Error:", error);
    toast({
      title: "❌ Error",
      description: "Attendance mark karte hue issue aya.",
    });
  } else {
    toast({
      title: "✅ Attendance Marked",
      description: `${student.name} marked ${status}.`,
    });
  }
};


 
   

  // 🔹 Save Daily Progress
  const handleSaveProgress = async () => {
    if (!progressText.trim() || !selectedStudent) return;

    const { error } = await supabase.from("student_progress").insert([
      {
        student_id: selectedStudent.id,
        teacher_id: teacherId,
        report_text: progressText,
      },
    ]);

    if (error)
      toast({ title: "Error", description: error.message });
    else {
      toast({ title: "Progress Saved ✅" });
      setProgressText("");
      setShowProgressModal(false);
    }
  };

  // 🔹 Save Complaint
  const handleSaveComplaint = async () => {
    if (!complaintText.trim() || !selectedStudent) return;

    const { error } = await supabase.from("student_complaints").insert([
      {
        student_id: selectedStudent.id,
        teacher_id: teacherId,
        complaint_text: complaintText,
      },
    ]);

    if (error)
      toast({ title: "Error", description: error.message });
    else {
      toast({ title: "Complaint Submitted 📨" });
      setComplaintText("");
      setShowComplaintModal(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border shadow-md p-6">
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse border border-gray-200 rounded-lg">
          <thead className="bg-green-100 text-green-800 text-left">
            <tr>
              <th className="p-3 border-b">Name</th>
              <th className="p-3 border-b">Roll No</th>
              <th className="p-3 border-b">Syllabus</th>
              <th className="p-3 border-b">Class Time</th>
              <th className="p-3 border-b text-center">Attendance</th>
              <th className="p-3 border-b text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.id} className="hover:bg-gray-50 transition">
                <td className="p-3">{s.name}</td>
                <td className="p-3">{s.roll_no}</td>
                <td className="p-3 text-sm text-gray-600">
                  {s.syllabus?.length ? s.syllabus.join(", ") : "—"}
                </td>
                <td className="p-3 text-sm text-gray-600">
                  {s.class_time || "—"}
                </td>
                <td className="p-3 text-center">
                  <div className="flex justify-center gap-2">
                    <Button
                      size="sm"
                      className={`${attendance[s.id] === "present" ? "bg-green-700" : "bg-green-500"} text-white`}
                      onClick={() => handleAttendance(s, "present")}
                    >
                      Present
                    </Button>
                    <Button
                      size="sm"
                      className={`${attendance[s.id] === "absent" ? "bg-red-700" : "bg-red-500"} text-white`}
                      onClick={() => handleAttendance(s, "absent")}
                    >
                      Absent
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {attendance[s.id] ? `Marked ${attendance[s.id]}` : "Not Marked"}
                  </p>
                </td>
                <td className="p-3 flex justify-center gap-2">
                  <Button
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={() => {
                      setSelectedStudent(s);
                      setShowProgressModal(true);
                    }}
                  >
                    Daily Progress
                  </Button>

                  <Button
                    size="sm"
                    variant="outline"
                    className="border-red-500 text-red-600 hover:bg-red-50"
                    onClick={() => {
                      setSelectedStudent(s);
                      setShowComplaintModal(true);
                    }}
                  >
                    Complaint
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Progress Modal */}
      <Dialog open={showProgressModal} onOpenChange={setShowProgressModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Write Progress for {selectedStudent?.name}
            </DialogTitle>
          </DialogHeader>
          <Textarea
            placeholder="Write today's progress..."
            value={progressText}
            onChange={(e) => setProgressText(e.target.value)}
            className="mt-2"
          />
          <DialogFooter>
            <Button onClick={handleSaveProgress} className="bg-green-600 text-white">
              Save Progress
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Complaint Modal */}
      <Dialog open={showComplaintModal} onOpenChange={setShowComplaintModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Submit Complaint for {selectedStudent?.name}
            </DialogTitle>
          </DialogHeader>
          <Textarea
            placeholder="Write complaint..."
            value={complaintText}
            onChange={(e) => setComplaintText(e.target.value)}
            className="mt-2"
          />
          <DialogFooter>
            <Button onClick={handleSaveComplaint} className="bg-red-600 text-white">
              Submit Complaint
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
