"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";

const getCookie = (name: string) => {
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? match[2] : null;
};

export default function StudentSyllabusPage() {
  const [syllabus, setSyllabus] = useState<any[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const roll = getCookie("student_roll");
      if (!roll) return;

      const { data: s } = await supabase
        .from("students")
        .select("syllabus")
        .eq("roll_no", roll)
        .maybeSingle();

      if (!s || !s.syllabus) return;

      const titles = Array.isArray(s.syllabus)
        ? s.syllabus
        : [s.syllabus];

      const { data } = await supabase
        .from("syllabus")
        .select("*")
        .in("title", titles);

      if (!data) return;

      const rowsWithSignedUrl = await Promise.all(
        data.map(async (row) => {
          if (row.image_url) {
            const fileName = row.image_url.split("/").pop();
            const { data: signedData } = await supabase.storage
              .from("syllabus-files")
              .createSignedUrl(fileName || "", 60 * 60);

            if (signedData?.signedUrl) {
              row.image_url = signedData.signedUrl;
            }
          }
          return row;
        })
      );

      setSyllabus(rowsWithSignedUrl);
    };

    load();
  }, []);

  const isMultiple = syllabus.length > 1;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">

        {/* 🔙 Back Button Top */}
        <div>
          <Button
            onClick={() => window.history.back()}
            variant="outline"
          >
            ← Back
          </Button>
        </div>

        <h1 className="text-3xl font-bold text-purple-700">
          📚 Your Syllabus
        </h1>

        {syllabus.length === 0 && (
          <div className="bg-white p-6 rounded-xl shadow text-center">
            No syllabus assigned
          </div>
        )}

        {syllabus.map((s) => (
          <div
            key={s.id}
            className="bg-white p-6 rounded-2xl shadow-md hover:shadow-lg transition space-y-4"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-purple-600">
                {s.title}
              </h2>

              {/* ✅ Show View button only if multiple syllabus */}
              {isMultiple && (
                <Button
                  size="sm"
                  onClick={() =>
                    setOpenId(openId === s.id ? null : s.id)
                  }
                >
                  {openId === s.id ? "Hide" : "View"}
                </Button>
              )}
            </div>

            {/* ✅ If single syllabus → always show */}
            {/* ✅ If multiple → show only when View clicked */}
            {(isMultiple ? openId === s.id : true) && (
              <div className="space-y-4 pt-3 border-t">
                {s.content && (
                  <p className="text-gray-700 leading-relaxed">
                    {s.content}
                  </p>
                )}

                {s.image_url && (
                  <img
                    src={s.image_url}
                    alt={s.title}
                    className="rounded-xl max-w-full shadow"
                  />
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
