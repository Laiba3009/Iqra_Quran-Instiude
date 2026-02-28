"use client";

import { useState, useEffect } from "react";
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

export default function AddSyllabus() {
  const [title, setTitle] = useState("");
  const [sections, setSections] = useState<Section[]>([]);
  const [rows, setRows] = useState<any[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewId, setViewId] = useState<string | null>(null);
  const [successId, setSuccessId] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const { data } = await supabase
      .from("syllabus")
      .select("*")
      .order("created_at", { ascending: false });

    setRows(data || []);
  };

  // ================= SECTION FUNCTIONS =================

  const addSection = () => {
    setSections([
      ...sections,
      { heading: "", description: "", points: [], table: [] },
    ]);
  };

  const updateSection = (index: number, field: string, value: any) => {
    const newSections = [...sections];
    (newSections[index] as any)[field] = value;
    setSections(newSections);
  };

  const addPoint = (index: number) => {
    const newSections = [...sections];
    newSections[index].points.push("");
    setSections(newSections);
  };

  const updatePoint = (sIndex: number, pIndex: number, value: string) => {
    const newSections = [...sections];
    newSections[sIndex].points[pIndex] = value;
    setSections(newSections);
  };

  const addTableRow = (index: number) => {
    const newSections = [...sections];
    newSections[index].table.push({ col1: "", col2: "" });
    setSections(newSections);
  };

  const updateTable = (
    sIndex: number,
    tIndex: number,
    field: string,
    value: string
  ) => {
    const newSections = [...sections];
    (newSections[sIndex].table[tIndex] as any)[field] = value;
    setSections(newSections);
  };

  // ================= FILE UPLOAD =================

  const uploadFile = async (): Promise<string | null> => {
    if (!file) return null;

    const cleanName = file.name
      .replace(/\s+/g, "-")
      .replace(/[^a-zA-Z0-9\.\-_]/g, "");

    const fileName = `${Date.now()}-${cleanName}`;

    const { error } = await supabase.storage
      .from("syllabus-files")
      .upload(fileName, file, {
        upsert: true,
        contentType: file.type,
      });

    if (error) {
      alert(error.message);
      return null;
    }

    const { data } = supabase.storage
      .from("syllabus-files")
      .getPublicUrl(fileName);

    return data.publicUrl;
  };

  // ================= SAVE =================

 const save = async () => {
  if (!title) return alert("Title is required");

  let fileUrl = null;

  if (file) {
    fileUrl = await uploadFile();
  }

  const payload = {
    title,
    sections,
    pdf_url: fileUrl, // ✅ correct
  };

  let response;

  if (editingId) {
    response = await supabase
      .from("syllabus")
      .update(payload)
      .eq("id", editingId)
      .select();
  } else {
    response = await supabase
      .from("syllabus")
      .insert([payload])
      .select();
  }

  if (response.error) return alert(response.error.message);

  setTitle("");
  setSections([]);
  setEditingId(null);
  setFile(null);
  loadData();
};

  const editRow = (row: any) => {
    setEditingId(row.id);
    setTitle(row.title);
    setSections(row.sections || []);
  };

 const deleteRow = async (row: any) => {
  if (!confirm("Delete this syllabus?")) return;

  if (row.pdf_url) {
    const path = row.pdf_url.split("/").pop();
    if (path) {
      await supabase.storage
        .from("syllabus-files")
        .remove([path]);
    }
  }

  await supabase.from("syllabus").delete().eq("id", row.id);
  loadData();
};

  // ================= UI =================

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-white to-blue-100 p-8">
      <div className="max-w-5xl mx-auto bg-white shadow-2xl rounded-3xl p-10 space-y-8">

        <h1 className="text-3xl font-extrabold text-green-700 text-center">
          {editingId ? "✏ Edit Syllabus" : "📘 Add Syllabus"}
        </h1>

        <div className="space-y-4">
          <input
            className="border-2 border-green-200 p-3 w-full rounded-xl"
            placeholder="Enter Syllabus Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <input
            type="file"
            accept="image/*,.pdf"
            onChange={(e) =>
              e.target.files && setFile(e.target.files[0])
            }
            className="border p-2 w-full rounded-lg"
          />

          <Button
            onClick={addSection}
            className="bg-blue-500 hover:bg-blue-600 text-white rounded-xl px-6"
          >
            + Add Section
          </Button>
        </div>

        {sections.map((section, sIndex) => (
          <div
            key={sIndex}
            className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 shadow-md rounded-2xl p-6 space-y-4"
          >
            <input
              className="border p-2 w-full rounded-lg"
              placeholder="Section Heading"
              value={section.heading}
              onChange={(e) =>
                updateSection(sIndex, "heading", e.target.value)
              }
            />

            <textarea
              className="border p-2 w-full rounded-lg"
              placeholder="Description"
              value={section.description}
              onChange={(e) =>
                updateSection(sIndex, "description", e.target.value)
              }
            />

            <div>
              <Button
                size="sm"
                onClick={() => addPoint(sIndex)}
                className="bg-green-500 text-white"
              >
                + Add Bullet
              </Button>

              {section.points.map((point, pIndex) => (
                <input
                  key={pIndex}
                  className="border p-2 w-full mt-2 rounded-lg"
                  placeholder="Bullet point"
                  value={point}
                  onChange={(e) =>
                    updatePoint(sIndex, pIndex, e.target.value)
                  }
                />
              ))}
            </div>

            <div>
              <Button
                size="sm"
                onClick={() => addTableRow(sIndex)}
                className="bg-purple-500 text-white"
              >
                + Add Table Row
              </Button>

              {section.table.length > 0 && (
                <table className="w-full mt-3 border rounded-lg overflow-hidden">
                  <tbody>
                    {section.table.map((row, tIndex) => (
                      <tr key={tIndex} className="bg-white">
                        <td className="border p-2">
                          <input
                            className="w-full outline-none"
                            placeholder="Column 1"
                            value={row.col1}
                            onChange={(e) =>
                              updateTable(
                                sIndex,
                                tIndex,
                                "col1",
                                e.target.value
                              )
                            }
                          />
                        </td>
                        <td className="border p-2">
                          <input
                            className="w-full outline-none"
                            placeholder="Column 2"
                            value={row.col2}
                            onChange={(e) =>
                              updateTable(
                                sIndex,
                                tIndex,
                                "col2",
                                e.target.value
                              )
                            }
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        ))}

        <Button
          onClick={save}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-2xl text-lg shadow-lg"
        >
          💾 Save Syllabus
        </Button>

        <hr />

        <h2 className="text-2xl font-bold text-gray-700">
          📚 All Syllabus
        </h2>

        <div className="space-y-4">
          {rows.map((r) => (
            <div
              key={r.id}
              className="p-6 rounded-2xl shadow-md border bg-white"
            >
              <div className="flex justify-between items-center">
                <h3 className="font-bold text-lg">{r.title}</h3>

                <div className="flex gap-2">
                  <Button size="sm" onClick={() => editRow(r)}>
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => deleteRow(r)}
                  >
                    Delete
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      setViewId(viewId === r.id ? null : r.id)
                    }
                  >
                    View
                  </Button>
                </div>
              </div>

              {viewId === r.id && (
                <div className="mt-4">
                  {r.pdf_url && (
                    <>
                      {r.pdf_url.endsWith(".pdf") ? (
                        <iframe
                          src={r.pdf_url}
                          className="w-full h-[600px] border rounded-lg"
                        />
                      ) : (
                        <img
                          src={r.pdf_url}
                          className="w-full max-h-[500px] object-contain rounded-lg"
                        />
                      )}
                    </>
                  )}

                  {(Array.isArray(r.sections)
                    ? r.sections
                    : JSON.parse(r.sections || "[]")
                  ).map((sec: Section, i: number) => (
                    <div key={i} className="mt-4 bg-gray-50 p-4 rounded-xl">
                      <h4 className="font-bold text-green-700">
                        {sec.heading}
                      </h4>
                      <p>{sec.description}</p>

                      {sec.points.length > 0 && (
                        <ul className="list-disc pl-6 mt-2">
                          {sec.points.map((p: string, idx: number) => (
                            <li key={idx}>{p}</li>
                          ))}
                        </ul>
                      )}

                      {sec.table.length > 0 && (
                        <table className="w-full border mt-3 bg-white">
                          <tbody>
                            {sec.table.map((t: any, idx: number) => (
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
    </div>
  );
}