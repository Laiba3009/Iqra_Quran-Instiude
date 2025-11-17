"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface Props {
  existingData?: any; // null = add mode, object = edit mode
  onSubmitDone: () => void;
}

export default function TeacherForm({ existingData, onSubmitDone }: Props) {
  const [name, setName] = useState("");
  const [joiningDate, setJoiningDate] = useState("");
  const [totalFee, setTotalFee] = useState(0);
  const [subjects, setSubjects] = useState("");
  const [securityFee] = useState(5000);
  const [agreement, setAgreement] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  // ✔ JAB EDIT MODE ME FORM OPEN HO
  useEffect(() => {
    if (existingData) {
      setName(existingData.name);
      setJoiningDate(existingData.joining_date);
      setTotalFee(existingData.total_fee);
      setSubjects(existingData.subjects);
    }
  }, [existingData]);

  const uploadAgreement = async () => {
    if (!agreement) return existingData?.agreement_file || null;

    const fileName = `agreement_${Date.now()}.${agreement.name.split(".").pop()}`;

    const { error } = await supabase.storage
      .from("teacher_agreements")
      .upload(fileName, agreement, { upsert: true });

    if (error) {
      console.log("Upload Error:", error);
      return existingData?.agreement_file || null;
    }

    const { data: urlData } = supabase.storage
      .from("teacher_agreements")
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const fileUrl = await uploadAgreement();

    if (existingData) {
      // ✔ EDIT MODE
      await supabase
        .from("teacher_salary_form")
        .update({
          name,
          joining_date: joiningDate,
          total_fee: totalFee,
          subjects,
          agreement_file: fileUrl,
        })
        .eq("id", existingData.id);
    } else {
      // ✔ ADD MODE
      await supabase.from("teacher_salary_form").insert([
        {
          name,
          joining_date: joiningDate,
          total_fee: totalFee,
          subjects,
          security_fee: securityFee,
          agreement_file: fileUrl,
        },
      ]);
    }

    onSubmitDone();
    setLoading(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="grid grid-cols-1 md:grid-cols-6 gap-4 p-4 border rounded bg-white shadow mb-6"
    >
      <div className="col-span-2">
        <label className="font-semibold">Teacher Name</label>
        <input
          type="text"
          className="border p-2 rounded w-full"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div className="col-span-2">
        <label className="font-semibold">Subjects</label>
        <input
          type="text"
          className="border p-2 rounded w-full"
          value={subjects}
          onChange={(e) => setSubjects(e.target.value)}
        />
      </div>

      <div className="col-span-2">
        <label className="font-semibold">Joining Date</label>
        <input
          type="date"
          className="border p-2 rounded w-full"
          value={joiningDate}
          onChange={(e) => setJoiningDate(e.target.value)}
        />
      </div>

      <div className="col-span-2">
        <label className="font-semibold">Total Fee</label>
        <input
          type="number"
          className="border p-2 rounded w-full"
          value={totalFee}
          onChange={(e) => setTotalFee(Number(e.target.value))}
        />
      </div>

      {/* Security fee only appears in ADD mode */}
      {!existingData && (
        <div className="col-span-2">
          <label className="font-semibold">Security Fee</label>
          <input
            type="number"
            className="border p-2 rounded w-full bg-gray-100"
            value={securityFee}
            readOnly
          />
        </div>
      )}

      <div className="col-span-2">
        <label className="font-semibold">Upload Agreement</label>
        <input
          type="file"
          className="border p-2 rounded w-full"
          onChange={(e) => setAgreement(e.target.files?.[0] || null)}
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
      >
        {loading
          ? "Saving..."
          : existingData
          ? "Update Teacher"
          : "Add Teacher"}
      </button>
    </form>
  );
}
