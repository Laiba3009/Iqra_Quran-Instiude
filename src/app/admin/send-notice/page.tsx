"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";

export default function SendNoticePage() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [visibleTo, setVisibleTo] = useState<"all" | "students" | "teachers">("all");
  const [notices, setNotices] = useState<any[]>([]);
  const { toast } = useToast();

  const [userRole, setUserRole] = useState<string>("admin"); // ✅ default admin

  useEffect(() => {
    const role = localStorage.getItem("userRole") || "admin";
    setUserRole(role);
    loadNotices();
  }, []);

  // 🔹 Load notices
  const loadNotices = async () => {
    const { data, error } = await supabase
      .from("notices")
      .select("*")
      .eq("deleted", false)
      .order("created_at", { ascending: false });

    if (!error) setNotices(data || []);
  };

  // 🔹 Send notice
  const sendNotice = async () => {
    if (!title.trim() || !message.trim()) {
      return toast({
        title: "Missing Fields",
        description: "Please enter both title and message.",
      });
    }

    const visibleRoles =
      visibleTo === "all"
        ? ["student", "teacher"]
        : visibleTo === "students"
        ? ["student"]
        : ["teacher"];

    const { error } = await supabase.from("notices").insert([
      {
        title,
        message,
        visible_to: visibleRoles,
        sender_role: userRole, // ✅ REQUIRED FIELD ADDED
        deleted: false,
      },
    ]);

    if (error) {
      console.log("SUPABASE ERROR:", error);
      return toast({ title: "Error", description: error.message });
    }

    toast({
      title: "Notice Sent ✅",
      description: "Your notice has been posted successfully.",
    });

    setTitle("");
    setMessage("");
    setVisibleTo("all");
    loadNotices();
  };

  // 🔹 Delete Notice
  const deleteNotice = async (id: number) => {
    if (!confirm("Are you sure you want to delete this notice?")) return;

    const { error } = await supabase
      .from("notices")
      .update({ deleted: true })
      .eq("id", id);

    if (error) {
      return toast({ title: "Error", description: error.message });
    }

    toast({ title: "Deleted", description: "Notice removed successfully." });
    loadNotices();
  };

  return (
    <div className="p-8 space-y-8">
      {/* Send Notice */}
      <Card className="shadow-lg border">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-green-700">
            Send New Notice
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Notice Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Textarea
            placeholder="Write your notice message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />

          <div className="flex gap-4 items-center">
            <label className="font-medium">Visible To:</label>
            <select
              value={visibleTo}
              onChange={(e) => setVisibleTo(e.target.value as any)}
              className="border rounded px-2 py-1"
            >
              <option value="all">All</option>
              <option value="students">Students</option>
              <option value="teachers">Teachers</option>
            </select>
          </div>

          <Button
            onClick={sendNotice}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            🚀 Send Notice
          </Button>
        </CardContent>
      </Card>

      {/* Notice List */}
      <Card className="shadow-lg border">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-green-700">
            Existing Notices
          </CardTitle>
        </CardHeader>
        <CardContent>
          {notices.length === 0 ? (
            <p className="text-gray-500">No notices yet.</p>
          ) : (
            <ul className="space-y-4">
              {notices.map((n) => (
                <li
                  key={n.id}
                  className="border p-4 rounded-lg bg-gray-50 flex justify-between items-start"
                >
                  <div className="w-[85%]">
                    <h3 className="font-semibold text-lg text-green-800">
                      {n.title}
                    </h3>
                    <p className="text-gray-700">{n.message}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(n.created_at).toLocaleString()} — Visible to:{" "}
                      {n.visible_to.join(", ")}
                      <br />
                      <span className="text-blue-600">
                        Sender: {n.sender_role}
                      </span>
                    </p>
                  </div>

                  <Button
                    onClick={() => deleteNotice(n.id)}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 text-sm"
                  >
                    🗑 Delete
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
