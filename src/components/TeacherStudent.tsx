"use client";
import ScheduleModal from "@/components/ScheduleModal";

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
  join_date?: string | null;
  class_days?: string[] | null;
  timezone?: string | null;
}

export default function TeacherStudents({ teacherId }: TeacherStudentsProps) {
  const [students, setStudents] = useState<Student[]>([]);
  const [teacherName, setTeacherName] = useState<string>("Unknown");

  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // Existing Modals
  const [showWeeklyModal, setShowWeeklyModal] = useState(false);
  const [showMonthlyModal, setShowMonthlyModal] = useState(false);
  const [showComplaintModal, setShowComplaintModal] = useState(false);

  // NEW Attendance Modal
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [attendanceStatus, setAttendanceStatus] =
    useState<"present" | "absent" | null>(null);
  const [attendanceDate, setAttendanceDate] = useState(
    new Date().toISOString().slice(0, 10)
  );

  const [weeklyText, setWeeklyText] = useState("");
  const [monthlyText, setMonthlyText] = useState("");
  const [complaintText, setComplaintText] = useState("");

  const [attendance, setAttendance] = useState<{ [key: string]: string }>({});

  const { toast } = useToast();

  // Load teacher name
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

  // Load assigned students
  useEffect(() => {
    if (teacherId) loadStudents();
  }, [teacherId]);

  const loadStudents = async () => {
    const { data, error } = await supabase
      .from("student_teachers")
      .select("students(id, name, roll_no, syllabus, class_time, join_date, class_days, timezone)")
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

    const initialAttendance: { [key: string]: string } = {};
    parsed.forEach((s) => (initialAttendance[s.id] = ""));
    setAttendance(initialAttendance);
  };

  // OPEN Attendance Modal
  const openAttendanceModal = (student: Student, status: "present" | "absent") => {
    setSelectedStudent(student);
    setAttendanceStatus(status);
    setAttendanceDate(new Date().toISOString().slice(0, 10));
    setShowAttendanceModal(true);
  };

  // SAVE attendance with selected date
  const saveAttendance = async () => {
    if (!selectedStudent || !attendanceStatus) return;

    setAttendance((prev) => ({ ...prev, [selectedStudent.id]: attendanceStatus }));

    const { error } = await supabase.from("tsattendance").insert([
      {
        student_id: selectedStudent.id,
        teacher_id: teacherId,
        date: attendanceDate,
        status: attendanceStatus,
      },
    ]);

    if (error) {
      toast({
        title: "❌ Error",
        description: "Attendance save nahi hui.",
      });
    } else {
      toast({
        title: "✅ Attendance Saved",
        description: `${selectedStudent.name} marked ${attendanceStatus} on ${attendanceDate}.`,
      });
    }

    setShowAttendanceModal(false);
  };

  // Weekly Report
  const handleSaveWeekly = async () => {
    if (!weeklyText.trim() || !selectedStudent) return;

    const { error } = await supabase.from("student_progress").insert([
      {
        student_id: selectedStudent.id,
        teacher_id: teacherId,
        report_text: weeklyText,
      },
    ]);

    if (!error) {
      toast({ title: "Weekly Report Saved ✅" });
      setWeeklyText("");
      setShowWeeklyModal(false);
    }
  };

  // Monthly Report
  const handleSaveMonthly = async () => {
    if (!monthlyText.trim() || !selectedStudent) return;

    const { error } = await supabase.from("student_monthly_reports").insert([
      {
        student_id: selectedStudent.id,
        teacher_id: teacherId,
        report_text: monthlyText,
      },
    ]);

    if (!error) {
      toast({ title: "Monthly Report Saved ✅" });
      setMonthlyText("");
      setShowMonthlyModal(false);
    }
  };

  // Complaint / Note
  const handleSaveComplaint = async () => {
    if (!complaintText.trim() || !selectedStudent) return;

    const { error } = await supabase.from("student_complaints").insert([
      {
        student_id: selectedStudent.id,
        teacher_id: teacherId,
        complaint_text: complaintText,
      },
    ]);

    if (!error) {
      toast({ title: "Complaint Submitted 📨" });
      setComplaintText("");
      setShowComplaintModal(false);
    }
  };

  // Check if new student
  const isNewStudent = (join_date?: string | null) => {
    if (!join_date) return false;
    const join = new Date(join_date);
    const today = new Date();
    return (today.getTime() - join.getTime()) / (1000 * 60 * 60 * 24) <= 30;
  };

  return (
    <div className="bg-white rounded-xl border shadow-md p-6">
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse border border-gray-200 rounded-lg">
          <thead className="bg-green-100 text-green-800">
            <tr>
              <th className="p-3 border-b">Name</th>
              <th className="p-3 border-b">Roll No</th>
              <th className="p-3 border-b">Joining Date</th>
              <th className="p-3 border-b text-center">Class Schedule</th>
              <th className="p-3 border-b text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {students.map((s) => (
              <tr key={s.id} className="hover:bg-gray-50">
                <td className="p-3">
                  {s.name}{" "}
                  {isNewStudent(s.join_date) && (
                    <span className="text-xs text-blue-600">(New)</span>
                  )}
                </td>

                <td className="p-3">{s.roll_no}</td>
                <td className="p-3">
                  {s.join_date
                    ? new Date(s.join_date).toLocaleDateString()
                    : "—"}
                </td>
<td className="p-3 text-center">
  {Array.isArray(s.class_days) && s.class_days.length > 0 ? (
    <ScheduleModal
      studentName={s.name}
      timezone={s.timezone || "Asia/Karachi"}
      classDays={s.class_days as any}
    />
  ) : (
    <span className="text-gray-400 text-sm">No Schedule</span>
  )}
</td>


                <td className="p-3 flex justify-center gap-2 flex-wrap">
                  <Button
                    size="sm"
                    className="bg-emerald-600 text-white"
                    onClick={() => {
                      setSelectedStudent(s);
                      setShowWeeklyModal(true);
                    }}
                  >
                    Weekly Report
                  </Button>

                  <Button
                    size="sm"
                    className="bg-blue-600 text-white"
                    onClick={() => {
                      setSelectedStudent(s);
                      setShowMonthlyModal(true);
                    }}
                  >
                    Monthly Report
                  </Button>

                  <Button
                    size="sm"
                    className="bg-pink-600 text-white"
                    onClick={() => {
                      setSelectedStudent(s);
                      setShowComplaintModal(true);
                    }}
                  >
                    Note
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      

      {/* Weekly Modal */}
      <Dialog open={showWeeklyModal} onOpenChange={setShowWeeklyModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Weekly Report for {selectedStudent?.name}</DialogTitle>
          </DialogHeader>

          <Textarea
            placeholder="Write weekly report..."
            value={weeklyText}
            onChange={(e) => setWeeklyText(e.target.value)}
          />

          <DialogFooter>
            <Button onClick={handleSaveWeekly} className="bg-emerald-600 text-white">
              Save Weekly Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Monthly Modal */}
      <Dialog open={showMonthlyModal} onOpenChange={setShowMonthlyModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Monthly Report for {selectedStudent?.name}</DialogTitle>
          </DialogHeader>

          <Textarea
            placeholder="Write monthly report..."
            value={monthlyText}
            onChange={(e) => setMonthlyText(e.target.value)}
          />

          <DialogFooter>
            <Button onClick={handleSaveMonthly} className="bg-blue-600 text-white">
              Save Monthly Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Complaint Modal */}
      <Dialog open={showComplaintModal} onOpenChange={setShowComplaintModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Submit Note for {selectedStudent?.name}</DialogTitle>
          </DialogHeader>

          <Textarea
            placeholder="Write note..."
            value={complaintText}
            onChange={(e) => setComplaintText(e.target.value)}
          />

          <DialogFooter>
            <Button onClick={handleSaveComplaint} className="bg-red-600 text-white">
              Submit Note
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
