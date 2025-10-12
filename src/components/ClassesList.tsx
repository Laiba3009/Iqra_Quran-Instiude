"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function ClassesList() {
  const [classes, setClasses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchClasses = async () => {
      const { data, error } = await supabase.from("classes").select("*");
      if (error) console.error(error);
      else setClasses(data);
      setLoading(false);
    };
    fetchClasses();
  }, []);

  if (loading) return <p className="text-center">Loading...</p>;

  const now = new Date();
  const nowTime = now.toTimeString().slice(0, 8); // HH:MM:SS

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {classes.map((cls) => {
        const active = nowTime >= cls.start_time && nowTime <= cls.end_time;

        return (
          <div
            key={cls.id}
            className="p-6 rounded-2xl shadow-lg border bg-white"
          >
            <h2 className="text-2xl font-bold text-green-800">
              {cls.teacher_name}
            </h2>
            <p className="text-lg text-brown-700">{cls.subject}</p>
            <p className="text-sm text-gray-500">
              {cls.start_time} – {cls.end_time}
            </p>

            {active ? (
              <a
                href={cls.zoom_link}
                target="_blank"
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg inline-block mt-4"
              >
                Join Class
              </a>
            ) : (
              <p className="text-red-500 font-semibold mt-4">Class not active</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
