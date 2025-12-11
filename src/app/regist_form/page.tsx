"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import moment from "moment-timezone";


export default function AddStudentPage() {
  const [form, setForm] = useState({
    name: "",
    timezone: "",
    contact: "",
    email: "",
    syllabus: [] as string[],
    fee_status: "unpaid",
    join_date: "",
  });

  const { toast } = useToast();
  const syllabusList = ["Quran", "Islamic Studies", "Tafseer", "Urdu", "English"];

      const allTimezones = moment.tz.names();
  
  // TIMEZONES (Client-only → Hydration error fixed)
  const [timezones, setTimezones] = useState<string[]>([]);

  useEffect(() => {
    const list = Intl.supportedValuesOf("timeZone");
    setTimezones(list);
  }, []);

  const toggleSyllabus = (name: string) => {
    setForm((prev) => ({
      ...prev,
      syllabus: prev.syllabus.includes(name)
        ? prev.syllabus.filter((c) => c !== name)
        : [...prev.syllabus, name],
    }));
  };

  const saveStudent = async () => {
    if (!form.name || !form.contact || !form.join_date) {
      alert("Please fill all required fields.");
      return;
    }

    const payload = { ...form };

    const { error } = await supabase
      .from("students")
      .insert([payload]);

    if (error) return alert(error.message);

    toast({ title: "✅ Student added successfully" });

    setForm({
      name: "",
      timezone: "",
      contact: "",
      email: "",
      syllabus: [],
      fee_status: "unpaid",
      join_date: "",
    });
  };

  return (
    <div className="min-h-screen bg-white text-black  px-4 md:px-8 py-10">

      <div className="max-w-3xl mx-auto bg-white border shadow-lg rounded-xl p-8  pt-20 space-y-6">
        <h1 className="text-3xl font-bold text-center text-blue-700">Add Student</h1>

        <div className="grid gap-4">
          {/* Name */}
          <input
            type="text"
            placeholder="Full Name *"
            className="p-3 rounded-lg border"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          {/* Contact (Required) */}
          <input
            type="text"
            placeholder="Contact Number *"
            className="p-3 rounded-lg border"
            value={form.contact}
            onChange={(e) => setForm({ ...form, contact: e.target.value })}
          />

          {/* Email (Optional) */}
          <input
            type="email"
            placeholder="Email (optional)"
            className="p-3 rounded-lg border"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />

          {/* Join Date */}
          <input
            type="date"
            className="p-3 rounded-lg border"
            value={form.join_date}
            onChange={(e) => setForm({ ...form, join_date: e.target.value })}
          />

          {/* Timezone Dropdown */}
         {/* Timezone Dropdown */}
<select
  className="border p-2 rounded-lg text-sm"
  value={form.timezone}
  onChange={(e) => setForm({ ...form, timezone: e.target.value })}
>
  <option value="">Select Timezone</option>
  {allTimezones.map((tz) => {
    const offsetMinutes = moment.tz(tz).utcOffset();
    const sign = offsetMinutes >= 0 ? "+" : "-";

    const hours = String(Math.floor(Math.abs(offsetMinutes) / 60)).padStart(2, "0");
    const mins = String(Math.abs(offsetMinutes) % 60).padStart(2, "0");

    return (
      <option key={tz} value={tz}>
        {`${tz} (UTC${sign}${hours}:${mins})`}
      </option>
    );
  })}
</select>


          {/* Syllabus */}
          <div>
            <h3 className="mb-2 font-semibold text-blue-700">Select Syllabus</h3>
            <div className="flex flex-wrap gap-2">
              {syllabusList.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => toggleSyllabus(s)}
                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                    form.syllabus.includes(s)
                      ? "bg-blue-700 text-white"
                      : "bg-gray-200 text-black hover:bg-gray-300"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Registration Button Centered */}
        <div className="flex justify-center">
          <Button
            onClick={saveStudent}
            className="px-10 py-3 bg-blue-700 text-white rounded-lg hover:bg-blue-600"
          >
            Registration
          </Button>
        </div>
      </div>
    </div>
  );
}
