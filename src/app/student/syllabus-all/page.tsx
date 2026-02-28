"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";

interface TableRow {
  col1: string;
  col2: string;
}

interface Section {
  heading: string;
  description: string;
  points: string[];
  table: TableRow[];
}

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

      setSyllabus(data);
    };

    load();
  }, []);

  const isMultiple = syllabus.length > 1;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">

        <Button
          onClick={() => window.history.back()}
          variant="outline"
        >
          ← Back
        </Button>

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
              <div className="space-y-4 pt-3 border-t">

                {/* ✅ PDF OR IMAGE */}
                {s.pdf_url && (
                  <>
                    {s.pdf_url.endsWith(".pdf") ? (
                      <iframe
                        src={s.pdf_url}
                        className="w-full h-[600px] border rounded-lg"
                      />
                    ) : (
                      <img
                        src={s.pdf_url}
                        className="rounded-xl max-w-full shadow"
                      />
                    )}
                  </>
                )}

                {/* ✅ SECTIONS */}
                {(Array.isArray(s.sections)
                  ? s.sections
                  : JSON.parse(s.sections || "[]")
                ).map((sec: Section, i: number) => (
                  <div key={i} className="bg-gray-50 p-4 rounded-xl">
                    <h4 className="font-bold text-purple-700">
                      {sec.heading}
                    </h4>

                    <p className="mt-1">{sec.description}</p>

                    {sec.points?.length > 0 && (
                      <ul className="list-disc pl-6 mt-2">
                        {sec.points.map((p, idx) => (
                          <li key={idx}>{p}</li>
                        ))}
                      </ul>
                    )}

                    {sec.table?.length > 0 && (
                      <table className="w-full border mt-3 bg-white">
                        <tbody>
                          {sec.table.map((t, idx) => (
                            <tr key={idx}>
                              <td className="border p-2">
                                {t.col1}
                              </td>
                              <td className="border p-2">
                                {t.col2}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                ))}

              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}