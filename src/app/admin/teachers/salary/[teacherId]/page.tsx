"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import SalaryAddForm from "@/components/SalaryAddForm";

// 🔵 Months for dropdown
const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December"
];

export default function TeacherSalaryPage() {
  const { teacherId } = useParams();

  const [teacher, setTeacher] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [records, setRecords] = useState<any[]>([]);
  const [security, setSecurity] = useState<any[]>([]);
  const [agreementUrl, setAgreementUrl] = useState<string | null>(null);

  const [loading, setLoading] = useState(true);
  const [agreementModal, setAgreementModal] = useState(false);
  const [securityModal, setSecurityModal] = useState(false);

  const [securityMonth, setSecurityMonth] = useState(1);
  const [securityYear, setSecurityYear] = useState(new Date().getFullYear());
  const [securityAmount, setSecurityAmount] = useState("");
const [filterMonth, setFilterMonth] = useState(new Date().getMonth() + 1);
const [filterYear, setFilterYear] = useState(new Date().getFullYear());


const monthStart = new Date(filterYear, filterMonth - 1, 1);
const monthEnd = new Date(filterYear, filterMonth, 0);

const monthlyStudents = students.filter((s) => {
  const join = new Date(s.join_date);
  const left = s.assign_end ? new Date(s.assign_end) : null;

  return (
    join <= monthEnd && 
    (!left || left >= monthStart)
  );
});

// -------- FETCH TEACHER --------
const fetchTeacher = async () => {
  const { data } = await supabase
    .from("teachers")
    .select("id, name, syllabus, salary_status, agreement_image")
    .eq("id", teacherId)
    .maybeSingle();

  if (data?.agreement_image) {
    const { data: url } = supabase.storage
      .from("teacher_agreements")
      .getPublicUrl(data.agreement_image);

    setAgreementUrl(url?.publicUrl);
  }

  setTeacher(data);
};
const deleteSecurity = async (id: number) => {
  // Sirf ye record delete hoga
  const { error } = await supabase
    .from("security_fee")
    .delete()
    .eq("id", id);

  if (error) {
    alert("Error deleting security fee!");
    return;
  }

  alert("Deleted successfully!");
  fetchSecurityFee(); // list refresh
};


  // -------- FETCH STUDENTS --------
  const fetchStudents = async () => {
    const { data } = await supabase
      .from("student_teachers")
      .select("teacher_fee, students(id, name, roll_no, join_date)")
      .eq("teacher_id", teacherId);

    const formatted = (data || []).map((s: any) => ({
      id: s.students?.id,
      name: s.students?.name,
      roll_no: s.students?.roll_no,
      join_date: s.students?.join_date,
      teacher_fee: s.teacher_fee,
    }));

    setStudents(formatted);
  };

  // -------- FETCH MONTHLY SALARY RECORDS --------
  const fetchRecords = async () => {
    const { data } = await supabase
      .from("monthly_salary")
      .select("*")
      .eq("teacher_id", teacherId)
      .order("year", { ascending: false })
      .order("month", { ascending: false });

    setRecords(data || []);
  };

  // -------- FETCH SECURITY FEES --------
  const fetchSecurityFee = async () => {
    const { data } = await supabase
      .from("security_fee")
      .select("*")
      .eq("teacher_id", teacherId)
      .order("year", { ascending: false })
      .order("month", { ascending: false });

    setSecurity(data || []);
  };

  // -------- LOAD EVERYTHING --------
  useEffect(() => {
    if (!teacherId) return;
    setLoading(true);

    Promise.all([
      fetchTeacher(),
      fetchStudents(),
      fetchRecords(),
      fetchSecurityFee(),
    ]).finally(() => setLoading(false));
  }, [teacherId]);

  if (loading) return <div className="p-6">Loading...</div>;

  if (!teacher)
    return (
      <div className="p-6 text-red-600">
        ❌ Teacher not found.
      </div>
    );

  // ------- CALCULATIONS -------
  const today = new Date();

  const validStudents = students.filter(
    (s) => !s.join_date || new Date(s.join_date) <= today
  );

  const totalStudentFee = validStudents.reduce(
    (a, b) => a + Number(b.teacher_fee || 0),
    0
  );

  const totalSalaryPaid = records.reduce(
    (s, r) => s + (r.base_salary + r.bonus - r.advance),
    0
  );

  // -------- Upload Agreement Image --------
  const uploadAgreement = async (e: any) => {
    const file = e.target.files[0];
    if (!file) return;

    const filePath = `${teacherId}/${Date.now()}-${file.name}`;

    const { error } = await supabase.storage
      .from("teacher_agreements")
      .upload(filePath, file, { upsert: true });

    if (error) {
      alert("Error uploading file!");
      return;
    }

    await supabase
      .from("teachers")
      .update({ agreement_image: filePath })
      .eq("id", teacherId);

    const { data: url } = supabase.storage
      .from("teacher_agreements")
      .getPublicUrl(filePath);

    setAgreementUrl(url?.publicUrl);

    alert("Agreement Uploaded!");
  };

  // -------- Save Security Fee --------
  const saveSecurityFee = async () => {
    if (!securityAmount) return alert("Enter amount");

    const { error } = await supabase.from("security_fee").insert({
      teacher_id: teacherId,
      month: securityMonth,
      year: securityYear,
      amount: Number(securityAmount),
    });

    if (error) {
      alert("Error saving security!");
      return;
    }

    await fetchSecurityFee();
    alert("Security Saved!");
    setSecurityAmount("");
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">{teacher.name} — Salary Dashboard</h1>

      {/* HEADER BUTTONS */}
      <div className="flex gap-4">
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded"
          onClick={() => setAgreementModal(true)}
        >
          Upload Agreement
        </button>

        <button
          className="bg-green-600 text-white px-4 py-2 rounded"
          onClick={() => setSecurityModal(true)}
        >
          Add Security Fee
        </button>
      </div>

      {/* AGREEMENT MODAL */}
      {agreementModal && (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center">
          <div className="bg-white p-6 rounded max-w-xl w-full">
            <h2 className="text-lg font-bold mb-4">Upload Agreement Image</h2>

            <input type="file" onChange={uploadAgreement} className="mb-4" />

            {agreementUrl && (
              <img
                src={agreementUrl}
                alt="Agreement"
                className="border rounded max-h-80 mx-auto"
              />
            )}

            <button
              className="w-full mt-4 bg-red-500 text-white p-2 rounded"
              onClick={() => setAgreementModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* SECURITY FEE MODAL */}
      {securityModal && (
        <div className="fixed inset-0 bg-black/50 flex justify-center items-center">
          <div className="bg-white p-6 rounded w-full max-w-lg">
            <h2 className="text-lg font-bold mb-4">Add Security Fee</h2>

            <label className="block mb-1">Month</label>
            <select
              className="border p-2 w-full mb-3"
              value={securityMonth}
              onChange={(e) => setSecurityMonth(Number(e.target.value))}
            >
              {MONTHS.map((m, i) => (
                <option key={i} value={i + 1}>
                  {m}
                </option>
              ))}
            </select>

            <label className="block mb-1">Year</label>
            <input
              type="number"
              value={securityYear}
              onChange={(e) => setSecurityYear(Number(e.target.value))}
              className="border p-2 w-full mb-3"
            />

            <label className="block mb-1">Amount</label>
            <input
              type="number"
              value={securityAmount}
              onChange={(e) => setSecurityAmount(e.target.value)}
              className="border p-2 w-full mb-4"
            />

            <button
              className="bg-green-600 w-full text-white py-2 rounded"
              onClick={saveSecurityFee}
            >
              Save Security Fee
            </button>

            {/* LIST */}
            <h3 className="mt-5 font-semibold">Security Records</h3>
            <ul className="mt-2 max-h-40 overflow-y-auto">
  {security.map((s) => (
    <li key={s.id} className="border p-2 mb-1 rounded flex justify-between items-center">
      <span>
        {MONTHS[s.month - 1]} {s.year} — Rs {s.amount}
      </span>

      <button
        className="text-red-600 font-bold"
        onClick={() => deleteSecurity(s.id)}
      >
        ❌
      </button>
       </li>
      ))}
    </ul>

            <button
              className="w-full mt-4 bg-red-500 text-white p-2 rounded"
              onClick={() => setSecurityModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* STUDENTS TABLE */}
     <div className="bg-white rounded shadow p-4">
  <h2 className="font-semibold mb-3 text-lg">Assigned Students</h2>
  <p>Total Fee: Rs {totalStudentFee}</p>

  {/* ===== Month Filter ===== */}
  <div className="flex gap-4 items-center mb-3">
    <label className="font-medium">Select Month:</label>
    <select
      className="border p-2"
      value={filterMonth}
      onChange={(e) => setFilterMonth(Number(e.target.value))}
    >
      {MONTHS.map((m, i) => (
        <option key={i} value={i + 1}>{m}</option>
      ))}
    </select>

    <label className="font-medium">Year:</label>
    <input
      type="number"
      className="border p-2 w-32"
      value={filterYear}
      onChange={(e) => setFilterYear(Number(e.target.value))}
    />
  </div>

  {/* ===== Students Table ===== */}
  <table className="w-full mt-3">
    <thead className="bg-gray-100">
      <tr>
        <th className="p-2 border">Name</th>
        <th className="p-2 border">Roll No</th>
        <th className="p-2 border">Join Date</th>
        <th className="p-2 border">Teacher Fee</th>
      </tr>
    </thead>
    <tbody>
      {monthlyStudents.map((s) => (
        <tr key={s.id} className="border-b">
          <td className="p-2">{s.name}</td>
          <td className="p-2">{s.roll_no || "—"}</td>
          <td className="p-2">{s.join_date ? new Date(s.join_date).toLocaleDateString() : "—"}</td>
          <td className="p-2">Rs {s.teacher_fee || 0}</td>
        </tr>
      ))}

      {monthlyStudents.length === 0 && (
        <tr>
          <td colSpan={4} className="text-center p-4 text-gray-500">
            No students for this month.
          </td>
        </tr>
      )}
    </tbody>
  </table>
</div>

      <div className="flex gap-4 items-center mb-3">
  <select
    className="border p-2"
    value={filterMonth}
    onChange={(e) => setFilterMonth(Number(e.target.value))}
  >
    {MONTHS.map((m, i) => (
      <option key={i} value={i + 1}>{m}</option>
    ))}
  </select>

  <input
    type="number"
    className="border p-2 w-32"
    value={filterYear}
    onChange={(e) => setFilterYear(Number(e.target.value))}
  />
</div>


      {/* ADD SALARY */}
      <SalaryAddForm
        teacherId={teacherId}
        baseSalary={totalStudentFee}
        onSaved={fetchRecords}
      />

      {/* SALARY RECORDS */}
      <div className="bg-white rounded shadow p-4">
        <h2 className="font-semibold mb-3 text-lg">Monthly Salary Records</h2>
        <p>Total Paid: Rs {totalSalaryPaid}</p>

        <table className="w-full mt-3">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">Month/Year</th>
              <th className="p-2 border">Base</th>
              <th className="p-2 border">Bonus</th>
              <th className="p-2 border">Advance</th>
              <th className="p-2 border">Total</th>
            </tr>
          </thead>

          <tbody>
            {records.map((r) => (
              <tr key={r.id} className="border-b">
                <td className="p-2">
                  {r.month}/{r.year}
                </td>
                <td className="p-2">{r.base_salary}</td>
                <td className="p-2 text-green-600">{r.bonus}</td>
                <td className="p-2 text-red-600">{r.advance}</td>
                <td className="p-2 font-semibold">
                  {r.base_salary + r.bonus - r.advance}
                </td>
              </tr>
            ))}

            {records.length === 0 && (
              <tr>
                <td colSpan={5} className="text-center p-4 text-gray-500">
                  No salary records.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
