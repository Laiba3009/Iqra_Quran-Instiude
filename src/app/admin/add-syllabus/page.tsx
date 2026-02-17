"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";

export default function AddSyllabus() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [type, setType] = useState<"text" | "image">("text");
  const [rows, setRows] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewRowId, setViewRowId] = useState<string | null>(null); // ✅ view toggle

  useEffect(() => {
    loadSyllabus();
  }, []);

const loadSyllabus = async () => {
  const { data } = await supabase
    .from("syllabus")
    .select("*")
    .order("created_at", { ascending: false });

  if (!data) return;

  // Private bucket: generate signed URL for each image
  const rowsWithSignedUrl = await Promise.all(
    data.map(async (row) => {
      if (row.image_url) {
        const { data: signedUrlData, error } = await supabase.storage
          .from("syllabus-files")
          .createSignedUrl(row.image_url.split("/").pop() || "", 60 * 60); // 1 hour

        if (!error) row.image_url = signedUrlData.signedUrl;
      }
      return row;
    })
  );

  setRows(rowsWithSignedUrl);
};


const uploadFile = async () => {
  if (!file) return null;

  const fileName = `${Date.now()}-${file.name}`;

  // Upload to storage
  const { data, error } = await supabase.storage
    .from("syllabus-files")
    .upload(fileName, file, {
      cacheControl: "3600",
      upsert: false
    });

  if (error) {
    alert("Upload error: " + error.message);
    return null;
  }

  // Generate public URL
  const { data: publicUrlData } = supabase.storage
    .from("syllabus-files")
    .getPublicUrl(fileName);

  return publicUrlData.publicUrl;
};


  const save = async () => {
    if (!title) return alert("Title required");

    let image_url = null;

    if (type === "image" && file) {
      image_url = await uploadFile();
      if (!image_url) return;
    }

    const payload = {
      title,
      content: type === "text" ? content : null,
      image_url: type === "image" ? image_url : null,
    };

    if (editingId) {
      await supabase.from("syllabus").update(payload).eq("id", editingId);
      alert("Updated");
    } else {
      await supabase.from("syllabus").insert([payload]);
      alert("Added");
    }

    setTitle("");
    setContent("");
    setFile(null);
    setEditingId(null);
    loadSyllabus();
  };

  const editRow = (row: any) => {
    setEditingId(row.id);
    setTitle(row.title);
    setContent(row.content || "");
    setType(row.image_url ? "image" : "text");
  };

  const deleteRow = async (id: string) => {
    if (!confirm("Delete?")) return;
    await supabase.from("syllabus").delete().eq("id", id);
    loadSyllabus();
  };

  return (
    <div className="p-6 space-y-4 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold text-green-700">
        {editingId ? "Edit Syllabus" : "Add Syllabus"}
      </h1>

      <input
        className="border p-2 rounded w-full"
        placeholder="Syllabus Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      <div className="flex gap-4">
        <label>
          <input
            type="radio"
            checked={type === "text"}
            onChange={() => setType("text")}
          />
          Text
        </label>

        <label>
          <input
            type="radio"
            checked={type === "image"}
            onChange={() => setType("image")}
          />
          Image / PDF
        </label>
      </div>

      {type === "text" && (
        <textarea
          className="border p-2 rounded w-full"
          rows={5}
          placeholder="Write syllabus..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
        />
      )}

      {type === "image" && (
        <input
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />
      )}

      <Button onClick={save} className="bg-green-600 text-white">
        Save
      </Button>

      <hr />

      <h2 className="font-bold text-lg">All Syllabus</h2>

      {rows.map((r) => (
        <div key={r.id} className="border p-3 rounded space-y-2">
          <div className="flex justify-between items-center">
            <p className="font-semibold">{r.title}</p>

            <div className="flex gap-2">
              <Button size="sm" onClick={() => editRow(r)}>
                Edit
              </Button>

              <Button
                size="sm"
                variant="destructive"
                onClick={() => deleteRow(r.id)}
              >
                Delete
              </Button>

              <Button
                size="sm"
                variant="outline"
                onClick={() =>
                  setViewRowId((prev) => (prev === r.id ? null : r.id))
                }
              >
                View
              </Button>
            </div>
          </div>

          {/* ✅ Show content when view clicked */}
          {viewRowId === r.id && (
            <div className="mt-2">
              {r.content && <p>{r.content}</p>}
              {r.image_url && (
                <img
                  src={r.image_url}
                  alt={r.title}
                  className="max-w-full h-auto rounded"
                />
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
