"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Card, CardContent } from "@/components/ui/card";

interface Student {
  id: number;
  name: string;
  roll_no: string;
  email: string;
  course: string;
}

export default function StudentSearchBar() {
  const [query, setQuery] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [filtered, setFiltered] = useState<Student[]>([]);

  // 🟢 Fetch all students (once)
  useEffect(() => {
    const fetchStudents = async () => {
      const { data, error } = await supabase.from("students").select("*");
      if (!error && data) {
        setStudents(data);
      }
    };
    fetchStudents();
  }, []);

  // 🟢 Filter students only when searching
  useEffect(() => {
    if (query.trim() === "") {
      setFiltered([]); // hide all when no search
      return;
    }

    const q = query.toLowerCase();
    const results = students.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.roll_no.toLowerCase().includes(q)
    );
    setFiltered(results);
  }, [query, students]);

  return (
    <div className="max-w-3xl mx-auto mt-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">🔍 Search Students</h2>

      {/* 🔍 Search Bar */}
      <input
        type="text"
        placeholder="Search by student name or roll number..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full mb-6 p-3 border-2 border-green-400 rounded-lg 
          focus:ring-2 focus:ring-green-500 focus:border-green-500 
          text-gray-800 placeholder-gray-400"
      />

      {/* 🧩 Results */}
      {filtered.length > 0 ? (
        <div className="grid gap-4">
          {filtered.map((student) => (
            <Card key={student.id} className="border-l-4 border-green-500">
              <CardContent className="p-4">
                <h3 className="font-semibold text-lg text-green-700">
                  {student.name}
                </h3>
                <p className="text-sm text-gray-600">
                  Roll No: {student.roll_no}
                </p>
                <p className="text-sm text-gray-600">Email: {student.email}</p>
                <p className="text-sm text-gray-600">Course: {student.course}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : query.trim() !== "" ? (
        <p className="text-center text-gray-500">No matching students found.</p>
      ) : null}
    </div>
  );
}
