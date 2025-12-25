"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import BannerSlider from "@/components/BannerSlider";
import RoleBasedLayout from "@/components/RoleBasedLayout";
import TodayClassesCard from "@/components/TodayClassesCard";

/* 🔹 Notice Board */
function NoticeComponent({ userRole }: { userRole: "student" | "teacher" }) {
  const [notices, setNotices] = useState<any[]>([]);

  useEffect(() => {
    const loadNotices = async () => {
      const { data } = await supabase
        .from("notices")
        .select("*")
        .contains("visible_to", [userRole])
        .eq("deleted", false)
        .order("created_at", { ascending: false });
      if (data) setNotices(data);
    };
    loadNotices();
  }, [userRole]);

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 shadow">
      <h2 className="text-lg font-bold text-yellow-800 mb-2">📢 Notice Board</h2>
      {notices.length === 0 ? (
        <p className="text-gray-500">No notices</p>
      ) : (
        notices.map((n) => (
          <div key={n.id} className="bg-white p-3 rounded shadow mb-2">
            
            <h3 className="font-semibold">{n.title}</h3>
            <p>{n.message}</p>
          </div>
        ))
      )}
    </div>
  );
}

/* 🔹 Cookie */
const getCookie = (name: string) => {
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? match[2] : null;
};

export default function StudentDashboard() {
  const { toast } = useToast();

  const [student, setStudent] = useState<any>(null);
  const [feeStatus, setFeeStatus] = useState<string | null>(null);

  const [showUpload, setShowUpload] = useState(false);
  const [feeImage, setFeeImage] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const [cancelReason, setCancelReason] = useState("");
  const [complaint, setComplaint] = useState("");
  const [suggestion, setSuggestion] = useState("");

  useEffect(() => {
    const load = async () => {
      const roll = getCookie("student_roll");
      if (!roll) return;

      const { data: s } = await supabase
        .from("students")
        .select("id, name, roll_no, timezone")
        .eq("roll_no", roll)
        .maybeSingle();

      if (!s) return;
      setStudent(s);

      const month = new Date().toISOString().slice(0, 7);
      const { data: fee } = await supabase
        .from("student_fees")
        .select("status")
        .eq("student_id", s.id)
        .eq("month", month)
        .maybeSingle();

      if (fee) setFeeStatus(fee.status);
    };
    load();
  }, []);

  /* 💰 Fee Upload */
  const uploadFeeProof = async () => {
    if (!feeImage) return;

    setUploading(true);
    const month = new Date().toISOString().slice(0, 7);
    const path = `${student.roll_no}/${Date.now()}.jpg`;

    await supabase.storage.from("fee_proofs").upload(path, feeImage);
    const { data } = supabase.storage.from("fee_proofs").getPublicUrl(path);

    await supabase.from("student_fees").upsert({
      student_id: student.id,
      month,
      proof_url: data.publicUrl,
      status: "pending",
    });

    toast({ title: "Fee uploaded ✅" });
    setFeeStatus("pending");
    setShowUpload(false);
    setFeeImage(null);
    setUploading(false);
  };

  /* ❌ Cancel Class */
  const submitCancel = async () => {
    if (!cancelReason.trim()) {
      toast({ title: "Enter cancel reason ❌" });
      return;
    }

    await supabase.from("cancel_classes").insert({
      student_id: student.id,
      reason: cancelReason,
    });

    toast({ title: "Class cancelled successfully ✅" });
    setCancelReason("");
  };

  /* 📝 Complaint */
  const submitComplaint = async () => {
    if (!complaint.trim()) {
      toast({ title: "Complaint empty ❌" });
      return;
    }

    await supabase.from("complaints").insert({
      student_id: student.id,
      message: complaint,
    });

    toast({ title: "Complaint submitted ✅" });
    setComplaint("");
  };

  /* 💡 Suggestion */
  const submitSuggestion = async () => {
    if (!suggestion.trim()) {
      toast({ title: "Suggestion empty ❌" });
      return;
    }

    await supabase.from("suggestions").insert({
      student_id: student.id,
      message: suggestion,
    });

    toast({ title: "Suggestion sent ✅" });
    setSuggestion("");
  };

  if (!student) return <div className="p-6">Loading...</div>;

  return (
    <RoleBasedLayout role="student">
      <div className="space-y-8 px-4 md:px-12 mt-8">
        <BannerSlider />

         <h1 className="text-3xl md:text-4xl font-bold text-center text-green-800">
          Welcome, {student.name} (Roll No: {student.roll_no})
        </h1>

        {/* Fee Button */}
        <div className="flex justify-end">
          {!feeStatus && (
            <Button onClick={() => setShowUpload(true)}>⬆ Upload Fee</Button>
          )}
          {feeStatus === "pending" && <Button disabled>⏳ Pending</Button>}
          {feeStatus === "approved" && <Button disabled>✅ Paid</Button>}
        </div>

        {/* Upload Modal */}
        {showUpload && (
          <div className="fixed inset-0 bg-black/60 flex justify-center items-center">
            <div className="bg-white p-6 rounded space-y-4 w-96">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFeeImage(e.target.files?.[0] || null)}
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowUpload(false)}>
                  Cancel
                </Button>
                <Button onClick={uploadFeeProof} disabled={uploading}>
                  Upload
                </Button>
              </div>
            </div>
          </div>
        )}

        <NoticeComponent userRole="student" />
        <TodayClassesCard studentId={student.id} timezone={student.timezone} />

        {/* ❌ Cancel Class */}
        <Card>
          <CardContent className="space-y-3">
            <h2 className="font-bold">❌ Cancel Class</h2>
            <Textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              placeholder="Reason..."
            />
            <Button onClick={submitCancel}>Submit</Button>
          </CardContent>
        </Card>

        {/* 📝 Complaint */}
        <Card>
          <CardContent className="space-y-3">
            <h2 className="font-bold">📝 Complaint</h2>
            <Textarea
              value={complaint}
              onChange={(e) => setComplaint(e.target.value)}
            />
            <Button onClick={submitComplaint}>Submit</Button>
          </CardContent>
        </Card>

        {/* 💡 Suggestion */}
        <Card>
          <CardContent className="space-y-3">
            <h2 className="font-bold">💡 Suggestion</h2>
            <Textarea
              value={suggestion}
              onChange={(e) => setSuggestion(e.target.value)}
            />
            <Button onClick={submitSuggestion}>Send</Button>
          </CardContent>
        </Card>
      </div>
    </RoleBasedLayout>
  );
}
