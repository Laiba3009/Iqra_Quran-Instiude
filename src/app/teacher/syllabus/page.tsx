"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";

function getCookie(name: string) {
  return document.cookie.split("; ").reduce((r, v) => {
    const parts = v.split("=");
    return parts[0].trim() === name
      ? decodeURIComponent(parts[1])
      : r;
  }, "");
}

export default function TeacherMySyllabus() {
  const [syllabus, setSyllabus] = useState<any[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);

 useEffect(() => {
  const load = async () => {
    const roll = getCookie("teacher_roll");
    if (!roll) return;

    const { data: teacher } = await supabase
      .from("teachers")
      .select("syllabus")
      .eq("roll_no", roll)
      .maybeSingle();

    if (!teacher || !teacher.syllabus) return;

    const titles = Array.isArray(teacher.syllabus)
      ? teacher.syllabus
      : [teacher.syllabus];

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

        <Button
          variant="outline"
          onClick={() => window.history.back()}
        >
          ← Back
        </Button>

        <h1 className="text-3xl font-bold text-purple-700">
          📚 My Syllabus
        </h1>

        {syllabus.length === 0 && (
          <div className="bg-white p-6 rounded-xl shadow text-center">
            No syllabus assigned
          </div>
        )}

        {syllabus.map((s) => (
          <div
            key={s.id}
            className="bg-white p-6 rounded-2xl shadow-md space-y-4"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-purple-600">
                {s.title}
              </h2>

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

            {(isMultiple ? openId === s.id : true) && (
              <div className="pt-3 border-t space-y-3">
                {s.content && <p>{s.content}</p>}
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
