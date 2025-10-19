"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

type FeeRecord = {
  id: number;
  month: string;
  status: string;
  proof_url?: string;
  students: {
    name: string;
    roll_no: string;
  };
};

export default function AdminFeeApprovals() {
  const [fees, setFees] = useState<FeeRecord[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // ---------------------------------
  // 🔹 Load fee records
  // ---------------------------------
  const loadFees = async () => {
    const { data, error } = await supabase
      .from("student_fees")
      .select(
        `id, month, status, proof_url, students(name, roll_no)`
      )
      .order("created_at", { ascending: false });

    if (!error && data) setFees(data as FeeRecord[]);
  };

  useEffect(() => {
    loadFees();
  }, []);

  // ---------------------------------
  // 🔹 Approve / Reject / Delete
  // ---------------------------------
  const updateStatus = async (id: number, status: string) => {
    await supabase.from("student_fees").update({ status }).eq("id", id);
    await loadFees();
  };

  const deleteProof = async (id: number, proof_url?: string) => {
    if (proof_url) {
      try {
        const path = proof_url.split("/fee_proofs/")[1];
        if (path) {
          await supabase.storage.from("fee_proofs").remove([path]);
        }
      } catch (err) {
        console.warn("Storage delete failed", err);
      }
    }
    await supabase.from("student_fees").delete().eq("id", id);
    await loadFees();
  };

  // ---------------------------------
  // 🔹 UI
  // ---------------------------------
  return (
    <div className="p-6 md:p-10 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-green-800 mb-6">
        🧾 Fee Proof Approvals
      </h1>

      {/* Image Popup Modal */}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="relative">
            <img
              src={selectedImage}
              alt="Fee proof"
              className="max-w-[90vw] max-h-[80vh] rounded-xl shadow-2xl"
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-3 -right-3 bg-white p-1.5 rounded-full shadow hover:bg-gray-200"
            >
              <X className="w-5 h-5 text-gray-700" />
            </button>
          </div>
        </div>
      )}

      {/* Fee Records Table */}
      <div className="overflow-x-auto bg-white rounded-xl shadow-lg">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-green-100 text-left">
            <tr>
              <th className="p-3">Student</th>
              <th className="p-3">Roll No</th>
              <th className="p-3">Month</th>
              <th className="p-3">Status</th>
              <th className="p-3">Proof</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {fees.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="text-center text-gray-500 p-6 font-medium"
                >
                  No records found
                </td>
              </tr>
            )}

            {fees.map((f) => (
              <tr key={f.id} className="border-t hover:bg-gray-50">
                <td className="p-3 font-medium">{f.students?.name || "—"}</td>
                <td className="p-3">{f.students?.roll_no || "—"}</td>
                <td className="p-3">{f.month}</td>
                <td
                  className={`p-3 font-semibold ${
                    f.status === "approved"
                      ? "text-green-600"
                      : f.status === "pending"
                      ? "text-yellow-600"
                      : "text-red-600"
                  }`}
                >
                  {f.status}
                </td>

                <td className="p-3">
                  {f.proof_url ? (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setSelectedImage(f.proof_url!)}
                    >
                      View Proof
                    </Button>
                  ) : (
                    <span className="text-gray-500">No Proof</span>
                  )}
                </td>

                <td className="p-3 flex flex-wrap gap-2">
                  {f.status !== "approved" && (
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-white"
                      onClick={() => updateStatus(f.id, "approved")}
                    >
                      Approve
                    </Button>
                  )}

                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => deleteProof(f.id, f.proof_url)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
