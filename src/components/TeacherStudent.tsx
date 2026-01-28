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
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const [showWeeklyModal, setShowWeeklyModal] = useState(false);
  const [showMonthlyModal, setShowMonthlyModal] = useState(false);
  const [showComplaintModal, setShowComplaintModal] = useState(false);

  const [weeklyText, setWeeklyText] = useState("");
  const [monthlyText, setMonthlyText] = useState("");
  const [complaintText, setComplaintText] = useState("");

  const { toast } = useToast();

  useEffect(() => {
    if (teacherId) loadStudents();
  }, [teacherId]);

  const loadStudents = async () => {
    const { data, error } = await supabase
      .from("student_teachers")
      .select(
        "students(id, name, roll_no, syllabus, class_time, join_date, class_days, timezone)"
      )
      .eq("teacher_id", teacherId);

    if (error) {
      toast({ title: "Error", description: "Failed to load students" });
      return;
    }

    setStudents(data.map((d: any) => d.students).filter(Boolean));
  };

  const isNewStudent = (join_date?: string | null) => {
    if (!join_date) return false;
    return (
      (Date.now() - new Date(join_date).getTime()) /
        (1000 * 60 * 60 * 24) <=
      30
    );
  };

  return (
    <div className="bg-white rounded-xl border shadow-sm p-4">
      {/* Desktop Table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full border-collapse">
          <thead className="bg-emerald-50 text-emerald-800">
            <tr>
              <th className="p-2 text-left">Student</th>
              <th className="p-2">Roll No</th>
              <th className="p-2">Join Date</th>
              <th className="p-2 text-center">Schedule</th>
              <th className="p-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr
                key={s.id}
                className="border-t hover:bg-gray-50 transition"
              >
                <td className="p-2 font-medium">
                  {s.name}
                  {isNewStudent(s.join_date) && (
                    <span className="ml-1 text-xs text-blue-600">(New)</span>
                  )}
                </td>
                <td className="p-2 text-center">{s.roll_no}</td>
                <td className="p-2 text-center">
                  {s.join_date
                    ? new Date(s.join_date).toLocaleDateString()
                    : "—"}
                </td>
                <td className="p-2 text-center">
                  {s.class_days?.length ? (
                    <ScheduleModal
                      studentName={s.name}
                      timezone={s.timezone || "Asia/Karachi"}
                      classDays={s.class_days as any}
                    />
                  ) : (
                    <span className="text-gray-400 text-sm">No Schedule</span>
                  )}
                </td>
                <td className="p-2">
                  <div className="flex justify-center gap-2 flex-wrap">
                    <Button
                      size="sm"
                      className="bg-emerald-600"
                      onClick={() => {
                        setSelectedStudent(s);
                        setShowWeeklyModal(true);
                      }}
                    >
                      Weekly
                    </Button>
                    <Button
                      size="sm"
                      className="bg-blue-600"
                      onClick={() => {
                        setSelectedStudent(s);
                        setShowMonthlyModal(true);
                      }}
                    >
                      Monthly
                    </Button>
                    <Button
                      size="sm"
                      className="bg-pink-600"
                      onClick={() => {
                        setSelectedStudent(s);
                        setShowComplaintModal(true);
                      }}
                    >
                      Note
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-3">
        {students.map((s) => (
          <div
            key={s.id}
            className="border rounded-lg p-3 shadow-sm space-y-2"
          >
            <div className="font-semibold">
              {s.name}
              {isNewStudent(s.join_date) && (
                <span className="ml-1 text-xs text-blue-600">(New)</span>
              )}
            </div>
            <div className="text-sm text-gray-600">
              Roll No: {s.roll_no}
            </div>
            <div className="text-sm text-gray-600">
              Join Date:{" "}
              {s.join_date
                ? new Date(s.join_date).toLocaleDateString()
                : "—"}
            </div>

            <div>
              {s.class_days?.length ? (
                <ScheduleModal
                  studentName={s.name}
                  timezone={s.timezone || "Asia/Karachi"}
                  classDays={s.class_days as any}
                />
              ) : (
                <span className="text-gray-400 text-sm">No Schedule</span>
              )}
            </div>

            <div className="flex gap-2 flex-wrap pt-1">
              <Button
                size="sm"
                className="bg-emerald-600"
                onClick={() => {
                  setSelectedStudent(s);
                  setShowWeeklyModal(true);
                }}
              >
                Weekly
              </Button>
              <Button
                size="sm"
                className="bg-blue-600"
                onClick={() => {
                  setSelectedStudent(s);
                  setShowMonthlyModal(true);
                }}
              >
                Monthly
              </Button>
              <Button
                size="sm"
                className="bg-pink-600"
                onClick={() => {
                  setSelectedStudent(s);
                  setShowComplaintModal(true);
                }}
              >
                Note
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* WEEKLY MODAL */}
      <Dialog open={showWeeklyModal} onOpenChange={setShowWeeklyModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Weekly Report — {selectedStudent?.name}
            </DialogTitle>
          </DialogHeader>
          <Textarea
            value={weeklyText}
            onChange={(e) => setWeeklyText(e.target.value)}
            placeholder="Write weekly report..."
          />
          <DialogFooter>
            <Button className="bg-emerald-600" onClick={() => setShowWeeklyModal(false)}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* MONTHLY MODAL */}
      <Dialog open={showMonthlyModal} onOpenChange={setShowMonthlyModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Monthly Report — {selectedStudent?.name}
            </DialogTitle>
          </DialogHeader>
          <Textarea
            value={monthlyText}
            onChange={(e) => setMonthlyText(e.target.value)}
            placeholder="Write monthly report..."
          />
          <DialogFooter>
            <Button className="bg-blue-600" onClick={() => setShowMonthlyModal(false)}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* NOTE MODAL */}
      <Dialog open={showComplaintModal} onOpenChange={setShowComplaintModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Note — {selectedStudent?.name}
            </DialogTitle>
          </DialogHeader>
          <Textarea
            value={complaintText}
            onChange={(e) => setComplaintText(e.target.value)}
            placeholder="Write note..."
          />
          <DialogFooter>
            <Button className="bg-pink-600" onClick={() => setShowComplaintModal(false)}>
              Submit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
