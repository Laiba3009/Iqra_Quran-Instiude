"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import SyllabusHome from "../syllabus/student/syllabus/page";

export default function StudentDashboard() {
  const [zoomLink, setZoomLink] = useState("");
  const [reason, setReason] = useState("");
  const [complaint, setComplaint] = useState("");
  const { toast } = useToast();

  // Fetch Zoom link
  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("settings")
        .select("current_zoom_link")
        .eq("id", 1)
        .maybeSingle();
      setZoomLink(data?.current_zoom_link || "");
    })();
  }, []);

  const join = () => {
    if (!zoomLink) {
      toast({
        title: "Zoom Link Missing",
        description: "Admin ne abhi tak zoom link set nahi kiya.",
      });
      return;
    }
    window.open(zoomLink, "_blank");
  };

  const cancel = async () => {
    if (!reason.trim()) {
      toast({
        title: "Missing Reason",
        description: "Please enter reason before sending.",
      });
      return;
    }
    const { error } = await supabase
      .from("cancel_reasons")
      .insert([{ student_id: null, reason }]);

    if (error) {
      toast({ title: "Error", description: error.message });
      return;
    }
    setReason("");
    toast({
      title: "Cancel Sent",
      description: "Your class cancel reason was sent to admin.",
    });
  };

  const sendComplaint = async () => {
    if (!complaint.trim()) {
      toast({
        title: "Missing Complaint",
        description: "Please write your complaint before sending.",
      });
      return;
    }
    const { error } = await supabase
      .from("complaints")
      .insert([{ student_id: null, teacher_id: null, complaint }]);

    if (error) {
      toast({ title: "Error", description: error.message });
      return;
    }
    setComplaint("");
    toast({
      title: "Complaint Sent",
      description: "Your complaint was delivered to admin.",
    });
  };

  return (
    <div className="space-y-6 p-4 md:p-8">
      <h1 className="text-3xl font-bold text-green-800">Student Dashboard</h1>

      {/* Join & Cancel Section */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Class Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-3 md:flex-row">
            <Button onClick={join} className="w-full md:w-auto">
              Join Class
            </Button>
            <div className="flex items-center gap-2 w-full">
              <input
                className="border p-2 rounded flex-1"
                placeholder="Cancel reason..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
              <Button
                className="bg-red-600 hover:bg-red-700 w-full md:w-auto"
                onClick={cancel}
              >
                Cancel & Send
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Complaint Section */}
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Teacher Complaint</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-2">
            <input
              className="border p-2 rounded flex-1"
              placeholder="Write complaint about teacher..."
              value={complaint}
              onChange={(e) => setComplaint(e.target.value)}
            />
            <Button
              className="bg-yellow-600 hover:bg-yellow-700 w-full md:w-auto"
              onClick={sendComplaint}
            >
              Send Complaint
            </Button>
          </div>
        </CardContent>
      </Card>

      <p className="text-sm text-gray-600">
        Join uses the latest Zoom link from Admin settings.
      </p>

      <SyllabusHome />
    </div>
  );
}
