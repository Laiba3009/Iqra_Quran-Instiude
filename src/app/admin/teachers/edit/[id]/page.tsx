"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import TeacherForm from "../../../../../components/TeacherForm";
import { useParams, useRouter } from "next/navigation";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function EditTeacherPage() {
  const { id } = useParams();
  const router = useRouter();

  const [teacher, setTeacher] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      const { data } = await supabase
        .from("teacher_salary_form")
        .select("*")
        .eq("id", id)
        .single();

      setTeacher(data);
    };

    fetchData();
  }, [id]);

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Edit Teacher</h1>

      {teacher && (
        <TeacherForm
          existingData={teacher}
          onSubmitDone={() => router.push("/admin/teachers")}
        />
      )}
    </div>
  );
}
