'use client';

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";

interface Teacher {
  id: string;
  name: string;
  roll_no: string;
}

interface Notification {
  id: string;
  message: string;
  read: boolean;
  created_at: string;
}

export default function TeacherLeaveRequestPage() {
  const [reason, setReason] = useState("");
  const [teacher, setTeacher] = useState<Teacher | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { toast } = useToast();

  const teacherId = "58e2e233-f013-4f45-8a3b-5842214b1006"; // replace with logged-in teacher ID

  // Load teacher info
  useEffect(() => {
    const loadTeacher = async () => {
      const { data, error } = await supabase
        .from("teachers")
        .select("id, name, roll_no")
        .eq("id", teacherId)
        .single();

      if (error || !data) {
        toast({ title: "Error", description: "Failed to load teacher info." });
        return;
      }
      setTeacher(data);
    };
    loadTeacher();
  }, []);

  // Load notifications
  useEffect(() => {
    const loadNotifications = async () => {
      const { data, error } = await supabase
        .from("teacher_notifications")
        .select("*")
        .eq("teacher_id", teacherId)
        .order("created_at", { ascending: false });
      if (!error && data) setNotifications(data);
    };

    loadNotifications();
    // Optionally poll every 10 seconds for new notifications
    const interval = setInterval(loadNotifications, 10000);
    return () => clearInterval(interval);
  }, []);

  // Submit leave request
  const handleSubmit = async () => {
    if (!reason.trim() || !teacher) {
      toast({ title: "Error", description: "Please enter a reason." });
      return;
    }

    const { error } = await supabase.from("teacher_leave").insert([
      {
        teacher_id: teacher.id,
        teacher_name: teacher.name,
        reason,
      },
    ]);

    if (error) {
      toast({ title: "Error", description: "Failed to request leave." });
    } else {
      toast({
        title: "Leave Requested ✅",
        description: "Your leave request has been sent to admin.",
      });
      setReason("");
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4 text-center">Leave Request</h1>

      <Textarea
        placeholder="Enter your reason for leave..."
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        className="mb-4"
      />

      <Button onClick={handleSubmit} className="bg-blue-600 text-white w-full mb-6">
        Send Leave Request
      </Button>

      <h2 className="text-xl font-bold mb-2">Notifications</h2>
      {notifications.length ? (
        <ul>
          {notifications.map(n => (
            <li
              key={n.id}
              className={`mb-2 p-2 border rounded ${n.read ? 'bg-gray-100' : 'bg-yellow-100'}`}
            >
              {n.message}{" "}
              <span className="text-xs text-gray-500">
                {new Date(n.created_at).toLocaleString()}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p>No notifications</p>
      )}
    </div>
  );
}
