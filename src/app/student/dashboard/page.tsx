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
    if (!feeImage || !student) return;

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
      <div className="container mx-auto px-4 py-8 space-y-8">
        <BannerSlider />

        <h1 className="text-3xl font-bold text-center">
          Welcome, {student.name} (Roll No: {student.roll_no})
        </h1>
        {/* Fee Button */}
                <div className="flex justify-end">
                  {!feeStatus && (
                    <Button onClick={() => setShowUpload(true)} className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg">
                      ⬆ Upload Fee
                    </Button>
                  )}
                  {feeStatus === "pending" && (
                    <Button disabled className="bg-amber-600 text-white px-4 py-2 rounded-lg">
                      ⏳ Pending
                    </Button>
                  )}
                  {feeStatus === "approved" && (
                    <Button disabled className="bg-emerald-600 text-white px-4 py-2 rounded-lg">
                      ✅ Paid
                    </Button>
                  )}
                </div>
   {/* Upload Modal */}
        {showUpload && (
          <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-xl space-y-4 w-96 border border-slate-200 dark:border-slate-700 shadow-2xl">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setFeeImage(e.target.files?.[0] || null)}
                className="w-full p-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowUpload(false)} className="border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200">
                  Cancel
                </Button>
                <Button onClick={uploadFeeProof} disabled={uploading} className="bg-blue-700 hover:bg-blue-800 text-white">
                  Upload
                </Button>
              </div>
            </div>
          </div>
        )}
        <div className="max-w-4xl mx-auto">
          <NoticeComponent userRole="student" />
        </div>

        <div className="max-w-4xl mx-auto">
          <TodayClassesCard studentId={student.id} timezone={student.timezone} />
        </div>

        {/* Cancel Request */}
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6 space-y-3">
            <h2 className="text-xl font-bold text-red-700">Cancel Class Request</h2>
            <Textarea
              placeholder="Write reason..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
            />
            <Button onClick={submitCancel} className="bg-red-600 text-white">
              Send Request
            </Button>
          </CardContent>
        </Card>

        {/* Complaint */}
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-6 space-y-3">
            <h2 className="text-xl font-bold text-yellow-700">Complaint Box</h2>
            <Textarea
              placeholder="Write your complaint..."
              value={complaint}
              onChange={(e) => setComplaint(e.target.value)}
            />
            <Button onClick={submitComplaint} className="bg-yellow-600 text-white">
              Submit Complaint
            </Button>
          </CardContent>
        </Card>

        {/* Suggestion */}
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-6 space-y-3">
            <h2 className="text-xl font-bold text-green-700">Teacher Suggestion</h2>
            <Textarea
              placeholder="Write your suggestion..."
              value={suggestion}
              onChange={(e) => setSuggestion(e.target.value)}
            />
            <Button onClick={submitSuggestion} className="bg-green-600 text-white">
              Send Suggestion
            </Button>
          </CardContent>
        </Card>
      </div>
    </RoleBasedLayout>
  );
}
