"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

/* cookie helper */
function getCookie(name: string) {
  return document.cookie.split("; ").reduce((r, v) => {
    const parts = v.split("=");
    return parts[0] === name ? decodeURIComponent(parts[1]) : r;
  }, "");
}

export default function TeacherAttendancePage() {
  const { toast } = useToast();

  /* main states */
  const [teacher, setTeacher] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<string[]>([]);

  const [open, setOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"mark" | "view">("mark");

  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [date, setDate] = useState("");
  const [subject, setSubject] = useState("");
  const [status, setStatus] = useState<"present" | "absent" | "">("");

  const [history, setHistory] = useState<any[]>([]);
const [loadingHistory, setLoadingHistory] = useState(false);


  /* load teacher */
  useEffect(() => {
    const roll = getCookie("teacher_roll");
    if (roll) loadTeacher(roll);
  }, []);

  const loadTeacher = async (roll: string) => {
    const { data } = await supabase
      .from("teachers")
      .select("*")
      .eq("roll_no", roll)
      .single();

    if (data) {
      setTeacher(data);
      setSubjects(data.syllabus || []);
      loadStudents(data.id);
    }
  };

  /* load students */
  const loadStudents = async (teacherId: string) => {
    const { data, error } = await supabase
      .from("student_teachers")
      .select(`students(id,name,roll_no,status)`)
      .eq("teacher_id", teacherId);

    if (error) {
      console.error(error);
      setStudents([]);
      return;
    }

    const normalized =
      data
        ?.filter((x: any) => x.students?.status === "active")
        .map((x: any) => x.students) ?? [];

    setStudents(normalized);
  };

  /* open mark attendance modal */
  const openMarkModal = (student: any, s: "present" | "absent") => {
    setSelectedStudent(student);
    setStatus(s);
    setDate("");
    setSubject("");
    setViewMode("mark");
    setOpen(true);
  };

  /* open view attendance modal */
const openViewModal = async (student: any) => {
  setSelectedStudent(student);
  setViewMode("view");
  setHistory([]);
  setOpen(true);
  setLoadingHistory(true);

  const { data, error } = await supabase
    .from("attendance_with_details_real")
    .select("*")
    .eq("student_id", student.id)
    .order("attendance_date", { ascending: false });

  setLoadingHistory(false);

  console.log("Fetched attendance:", data);

  if (error) {
    console.error(error);
    setHistory([]);
    return;
  }

  setHistory(data || []);
};


  /* save attendance */
  const saveAttendance = async () => {
    if (!date || !subject || !status) {
      toast({
        title: "⚠️ Missing Info",
        description: "Date aur subject select karein",
      });
      return;
    }

    const { error } = await supabase
      .from("attendance_with_details_real")
      .insert([
        {
          attendance_date: date,
          subject,
          status,
          student_id: selectedStudent.id,
          student_name: selectedStudent.name,
          roll_no: selectedStudent.roll_no,
          teacher_id: teacher.id,
          teacher_name: teacher.name,
        },
      ]);

    if (error) {
      toast({ title: "❌ Error", description: error.message });
    } else {
      toast({ title: "✅ Attendance Saved" });
      setOpen(false);
    }
  };

  return (
    <div className="pt-24 px-6 pb-10">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl text-center">
            📋 Student Attendance
          </CardTitle>
        </CardHeader>

        <CardContent>
          <table className="w-full border">
            <thead className="bg-gray-100">
              <tr>
                <th className="border p-2">Name</th>
                <th className="border p-2">Roll</th>
                <th className="border p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.length > 0 ? (
                students.map((s) => (
                  <tr key={s.id}>
                    <td className="border p-2">{s.name}</td>
                    <td className="border p-2">{s.roll_no}</td>
                    <td className="border p-2 flex gap-2 justify-center">
                      <Button
                        className="bg-green-600 text-white"
                        onClick={() => openMarkModal(s, "present")}
                      >
                        Present
                      </Button>

                      <Button
                        className="bg-red-600 text-white"
                        onClick={() => openMarkModal(s, "absent")}
                      >
                        Absent
                      </Button>

                      <Button
                        variant="outline"
                        className="bg-purple-800 text-white hover:bg-purple-500"
                        onClick={() => openViewModal(s)}
                                              >
                        View Attendance
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="text-center p-4 text-gray-500">
                    No assigned students found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
      {/* MODAL */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <div className="max-h-[80vh] overflow-auto">
            <DialogHeader>
              <DialogTitle>
                {viewMode === "mark"
                  ? `Mark Attendance – ${selectedStudent?.name}`
                  : `Attendance History – ${selectedStudent?.name}`}
              </DialogTitle>
            </DialogHeader>

          {viewMode === "mark" ? (
            <div className="space-y-3">
              <input
                type="date"
                className="border p-2 w-full"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />

              <select
                className="border p-2 w-full"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              >
                <option value="">Select Subject</option>
                {subjects.map((s, i) => (
                  <option key={i} value={s}>
                    {s}
                  </option>
                ))}
              </select>

              <div className="font-semibold">
                Status:{" "}
                <span
                  className={
                    status === "present"
                      ? "text-green-600"
                      : "text-red-600"
                  }
                >
                  {status.toUpperCase()}
                </span>
              </div>

              <Button onClick={saveAttendance} className="w-full">
                Save Attendance
              </Button>
            </div>
       ) : (
  <>
    {loadingHistory ? (
      <p className="text-center py-4">Loading attendance...</p>
    ) : history.length === 0 ? (
      <p className="text-center py-4 text-gray-500">
        No attendance found
      </p>
    ) : (
      <table className="w-full border mt-3">
        <thead className="bg-gray-100">
          <tr>
            <th className="border p-2">Date</th>
            <th className="border p-2">Subject</th>
            <th className="border p-2">Status</th>
          </tr>
        </thead>
        <tbody>
          {history.map((h) => (
            <tr key={h.id}>
              <td className="border p-2">{h.attendance_date}</td>
              <td className="border p-2">{h.subject}</td>
              <td
                className={`border p-2 font-semibold ${
                  h.status === "present"
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {h.status.toUpperCase()}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    )}
  </>
)}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
