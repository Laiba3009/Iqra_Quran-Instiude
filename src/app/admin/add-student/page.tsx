"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import BackButton from "@/components/ui/BackButton";
import { useToast } from "@/components/ui/use-toast";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import TimeWithTimeZone from "@/components/TimeWithTimezone";
import moment from "moment-timezone";
import ScheduleModal from "@/components/ScheduleModal";

export default function AddStudent() {
  const [form, setForm] = useState({
    id: "",
    name: "",
    roll_no: "",
    timezone: "",   // ← add this
    contact: "",
    email: "",
    syllabus: [] as string[],
    academy_fee: "",
    student_total_fee: "",
    fee_status: "unpaid",
    join_date: "",
  
    class_days: [] as { day: string; subject: string; time: string }[],
  });

  const [teacherList, setTeacherList] = useState<
    { id: string; name: string; email: string; amount?: number; selected?: boolean }[]
  >([]);
  const [rows, setRows] = useState<any[]>([]);
  const [editing, setEditing] = useState(false);
  const [search, setSearch] = useState("");
  const { toast } = useToast();

  const syllabusList = ["Quran", "Islamic Studies", "Tafseer", "Urdu", "English"];
  const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

    const allTimezones = moment.tz.names();

  useEffect(() => {
    loadRows();
    loadTeachers();
  }, []);

  // ================= Load Students =================
  const loadRows = async () => {
    const { data: students } = await supabase
      .from("students")
      .select("*")
      .order("created_at", { ascending: false });
    if (!students) return;

    const fullData = await Promise.all(
      students.map(async (s) => {
        const { data: teacherMap } = await supabase
          .from("student_teachers")
          .select("teacher_fee, teachers(name)")
          .eq("student_id", s.id);

        const totalTeacherFee = teacherMap?.reduce((sum, t) => sum + Number(t.teacher_fee || 0), 0) || 0;
        const totalFee = Number(s.academy_fee || 0) + totalTeacherFee;

        return {
          ...s,
          teacherNames:
            teacherMap?.map((m) => {
              const t = Array.isArray(m.teachers) ? m.teachers[0] : m.teachers;
              return `${t?.name ?? "Unknown"} (Rs ${m.teacher_fee})`;
            }) || [],
          teacherFee: totalTeacherFee,
          totalFee: s.student_total_fee || totalFee,
        };
      })
    );

    setRows(fullData);
  };

  const loadTeachers = async () => {
    const { data, error } = await supabase.from("teachers").select("id, name, email");
    if (!error && data) setTeacherList(data);
  };

  const handleToggleStatus = async (studentId: string, currentStatus: string) => {
  try {
    const newStatus = currentStatus === "active" ? "disabled" : "active";

    const { error } = await supabase
      .from("students")
      .update({ status: newStatus })
      .eq("id", studentId);

    if (error) throw error;

    alert(`Student is now ${newStatus}!`);
    await loadRows(); // refresh the table
  } catch (err: any) {
    alert(err.message);
  }
};


  // ================= Toggle Functions =================
  const toggleSyllabus = (name: string) => {
    setForm((prev) => ({
      ...prev,
      syllabus: prev.syllabus.includes(name)
        ? prev.syllabus.filter((c) => c !== name)
        : [...prev.syllabus, name],
    }));
  };

  const toggleTeacher = (teacherId: string) => {
    setTeacherList((prev) =>
      prev.map((t) => (t.id === teacherId ? { ...t, selected: !t.selected } : t))
    );
  };

  const handleTeacherFeeChange = (teacherId: string, value: string) => {
    setTeacherList((prev) =>
      prev.map((t) => (t.id === teacherId ? { ...t, amount: Number(value) || 0 } : t))
    );
  };

  const addClassDay = (day: string) => {
  setForm(prev => ({
    ...prev,
    class_days: [...prev.class_days, { day, subject: "", time: "" }],
  }));
};

const handleClassChange = (
  day: string,
  realIndex: number,
  field: "subject" | "time",
  value: string
) => {
  setForm(prev => ({
    ...prev,
    class_days: prev.class_days.map((d, i) =>
      i === realIndex ? { ...d, [field]: value || "" } : d
    ),
  }));
};

const removeClass = (realIndex: number) => {
  setForm(prev => ({
    ...prev,
    class_days: prev.class_days.filter((_, i) => i !== realIndex),
  }));
};



  // 🟢 Time ko clean 12-hour AM/PM me convert karega
function cleanTime(t: string) {
  if (!t) return "";

  const [hour, minute] = t.split(":");
  let h = Number(hour);
  const m = minute;
  const period = h >= 12 ? "PM" : "AM";

  h = h % 12 || 12;

  return `${h}:${m} ${period}`;
}

  // ================= Save Student =================
  const save = async () => {
  // Check if any added class has empty subject
  const invalidSubjects = form.class_days.filter(d => d.subject.trim() === "");
  if (invalidSubjects.length > 0) {
    alert("Please enter subject for all class days");
    return;
  }

  // Check if user added at least one class
  if (form.class_days.length === 0) {
    alert("Please add at least one class");
    return;
  }

  // Check if any added class has empty time
  const invalidTimes = form.class_days.filter(d => d.subject && (!d.time || d.time.trim() === ""));
  if (invalidTimes.length > 0) {
    alert("Please select time for all added classes");
    return;
  }

  // Proceed with teacher selection and fees calculation
  const selectedTeachers = teacherList.filter(t => t.selected);
  const totalTeacherFee = selectedTeachers.reduce((sum, t) => sum + (t.amount || 0), 0);
  const academyFee = Number(form.student_total_fee || 0) - totalTeacherFee;
  const totalFee = Number(form.student_total_fee || 0);

  const class_days_utc = form.class_days.map(d => ({
    ...d,
    time: d.time,
  }));

  const payload = {
    name: form.name,
    roll_no: form.roll_no,
    contact: form.contact,
    email: form.email,
    syllabus: form.syllabus,
    student_total_fee: totalFee,
    fee_status: form.fee_status,
    join_date: form.join_date || null,
    class_days: class_days_utc,
    timezone: form.timezone || "Pakistan (PKT)",
    academy_fee: academyFee,
  };

  if (editing) {
    await supabase.from("students").update(payload).eq("id", form.id);
    await supabase.from("student_teachers").delete().eq("student_id", form.id);

    if (selectedTeachers.length > 0) {
      const map = selectedTeachers.map(t => ({
        student_id: form.id,
        teacher_id: t.id,
        teacher_fee: t.amount || 0,
      }));
      await supabase.from("student_teachers").insert(map);
    }

    toast({ title: "✅ Student updated successfully" });
  } else {
    const { data: inserted, error } = await supabase.from("students").insert([payload]).select().single();
    if (error) return alert(error.message);

    if (selectedTeachers.length > 0) {
      const map = selectedTeachers.map(t => ({
        student_id: inserted.id,
        teacher_id: t.id,
        teacher_fee: t.amount || 0,
      }));
      await supabase.from("student_teachers").insert(map);
    }

    toast({ title: "✅ Student added successfully" });
  }

  // Reset form
  setForm({
    id: "",
    name: "",
    roll_no: "",
    timezone: "",
    contact: "",
    email: "",
    syllabus: [],
    academy_fee: "",
    student_total_fee: "",
    fee_status: "unpaid",
    join_date: "",
    class_days: [],
  });
  setTeacherList(prev => prev.map(x => ({ ...x, selected: false, amount: 0 })));
  setEditing(false);
  await loadRows();
};


  // ================= Edit Student =================
  const editStudent = async (student: any) => {
    const { data: map } = await supabase
      .from("student_teachers")
      .select("teacher_id, teacher_fee")
      .eq("student_id", student.id);

   const localClassDays = (student.class_days || []).map((d) => ({
  ...d,
  time: d.time
    ? String(d.time).substring(0, 5) // 👈 Yahi correct & safe solution
    : "",
}));

    setForm({
      id: student.id,
      name: student.name,
      roll_no: student.roll_no,
      timezone: student.timezone || "",
      contact: student.contact,
      email: student.email,
      syllabus: student.syllabus ?? [],
      academy_fee: student.academy_fee,
      student_total_fee: student.student_total_fee,
      fee_status: student.fee_status,
      join_date: student.join_date ?? "",
      class_days: localClassDays,
    });

    setTeacherList((prev) =>
      prev.map((t) => {
        const found = map?.find((m) => m.teacher_id === t.id);
        return found ? { ...t, selected: true, amount: found.teacher_fee } : { ...t, selected: false, amount: 0 };
      })
    );

    setEditing(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ================= Toggle Fee =================
  const toggleFee = async (id: string, status: string) => {
    const newStatus = status === "paid" ? "unpaid" : "paid";
    await supabase.from("students").update({ fee_status: newStatus }).eq("id", id);
    await loadRows();
  };

  // ================= Delete Student =================
  const del = async (id: string) => {
    if (!confirm("Are you sure to delete?")) return;
    await supabase.from("student_teachers").delete().eq("student_id", id);
    await supabase.from("students").delete().eq("id", id);
    await loadRows();
  };

  // ================= Format 12-hour time =================
  // Convert UTC HH:MM → 12-hour format
  function formatTime12Hour(utcTime: string, tzOffset = 5) { // default Pakistan offset
  if (!utcTime) return "—";
  const [hh, mm] = utcTime.split(":").map(Number);
  let local = hh + tzOffset;
  if (local >= 24) local -= 24;
  if (local < 0) local += 24;

  const period = local >= 12 ? "PM" : "AM";
  const h12 = local % 12 || 12;

  return `${h12}:${String(mm).padStart(2, "0")} ${period}`;
}



  const filteredRows = rows.filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.roll_no.toLowerCase().includes(search.toLowerCase())
  );

  // ================= PDF Download =================
  const downloadPDF = () => {
    const doc = new jsPDF("p", "mm", "a4");
    const logo = new Image();
    logo.src = "/images/logo1.jpg";
    logo.onload = () => {
      doc.addImage(logo, "JPEG", 10, 8, 20, 20);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.text("Iqra Online Quran Institute", 35, 18);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);
      doc.text("Student Details Report", 35, 26);
      doc.setDrawColor(150);
      doc.line(10, 32, 200, 32);

      const tableData = filteredRows.map((r) => [
        r.name,
        r.roll_no,
        Array.isArray(r.class_days)
          ? r.class_days.map((d) => `${d.day} (${d.subject} - ${formatTime12Hour(d.time)})`).join(", ")
          : "—",
        r.teacherNames.join(", ") || "—",
        `Rs ${r.student_total_fee || 0}`,
        r.fee_status.toUpperCase(),
      ]);

      autoTable(doc, {
        startY: 40,
        head: [["Name", "Roll", "Class Days", "Teachers", "Total Fee", "Status"]],
        body: tableData,
        styles: { fontSize: 9 },
        headStyles: { fillColor: [34, 139, 34] },
        alternateRowStyles: { fillColor: [245, 255, 245] },
      });

      const date = new Date().toLocaleString();
      doc.setFontSize(10);
      doc.text(`Generated on: ${date}`, 10, 285);
      doc.save("students_list.pdf");
    };
  };
  function isNewStudent(joinDate: string) {
  if (!joinDate) return false;

  const join = new Date(joinDate);
  const now = new Date();

  const diffDays = (now.getTime() - join.getTime()) / (1000 * 60 * 60 * 24);
  return diffDays <= 30; // last 30 days
}


  return (
    <div className="bg-blue-100 min-h-screen px-4 md:px-8 space-y-8 pb-10">
      {/* Back Button */}
      <BackButton href="/admin/dashboard" label="Back" />

      {/* Form */}
      <div className="bg-white rounded-xl shadow-lg p-6 space-y-4 max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-green-800">{editing ? "Edit Student" : "Add Student"}</h1>

        <div className="grid md:grid-cols-2 gap-3">
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

          <input
            className="border p-2 rounded-lg text-sm"
            placeholder="Full Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            className="border p-2 rounded-lg text-sm"
            placeholder="Roll No"
            value={form.roll_no}
            onChange={(e) => setForm({ ...form, roll_no: e.target.value })}
          />
          <input
            className="border p-2 rounded-lg text-sm"
            placeholder="Contact"
            value={form.contact}
            onChange={(e) => setForm({ ...form, contact: e.target.value })}
          />
          <input
            className="border p-2 rounded-lg text-sm"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
 <input
  className="border p-2 rounded-lg text-sm"
  placeholder="Total Fee"
  value={form.student_total_fee}
  onChange={(e) => setForm({ ...form, student_total_fee: e.target.value })}
/>


          <input
            type="date"
            className="border p-2 rounded-lg text-sm"
            value={form.join_date}
            onChange={(e) => setForm({ ...form, join_date: e.target.value })}
          />
        </div>

        {/* Syllabus */}
        <h3 className="font-semibold mb-2 text-gray-700">Select Syllabus</h3>
        <div className="flex flex-wrap gap-2 mb-4">
          {syllabusList.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => toggleSyllabus(s)}
              className={`px-3 py-1 rounded-full border text-sm ${
                form.syllabus.includes(s)
                  ? "bg-green-600 text-white border-green-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-green-50"
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Class Days & Time */}
        <h3 className="font-semibold mb-2 text-gray-700">Select Class Days & Time</h3>
        <div className="flex flex-wrap gap-2 mb-4">
         {weekDays.map(day => {
  const dayClasses = form.class_days.filter(d => d.day === day);

  return (
    <div key={day} className="border rounded-lg px-2 py-1">
      <label className="flex items-center gap-1">
        {day}
      </label>
      {form.class_days
  .map((cls, i) => ({ ...cls, realIndex: i }))
  .filter(cls => cls.day === day)
  .map(cls => (
    <div key={cls.realIndex} className="flex gap-2 mt-2">
      
<input
  type="text"
  required
  placeholder="Subject (e.g. Quran, English)"
  className="border p-1 rounded w-28 text-sm"
  value={cls.subject || ""}
  onChange={(e) =>
    handleClassChange(day, cls.realIndex, "subject", e.target.value)
  }
/>

<TimeWithTimeZone
  value={cls.time}
  timezone="Asia/Karachi"
  onChange={(time) =>
    handleClassChange(day, cls.realIndex, "time", time || "")
  }
/>


<Button
  size="sm"
  variant="destructive"
  onClick={() => removeClass(cls.realIndex)}
>
  Remove
</Button>

        </div>
      ))}

      <Button size="sm" onClick={() => addClassDay(day)}>Add Class</Button>
    </div>
  );
})}

        </div>

        {/* Assign Teachers */}
        <h3 className="font-semibold mb-2 text-gray-700">Assign Teachers & Fees</h3>
      <div className="flex flex-wrap gap-2 mb-4">
  {teacherList.map((t) => (
    <div key={t.id} className={`border rounded-lg p-2 ${t.selected ? "bg-green-50 border-green-500" : ""}`}>
      <label className="flex flex-col gap-1">
        <div className="flex items-center gap-1">
          <input type="checkbox" checked={!!t.selected} onChange={() => toggleTeacher(t.id)} />
          {t.name}
        </div>
        {t.selected && (
          <input
            type="number"
            placeholder="Fee"
            className="border p-1 rounded w-16 mt-1 text-sm"
            value={t.amount || ""}
            onChange={(e) => handleTeacherFeeChange(t.id, e.target.value)}
          />
        )}
      </label>
    </div>
  ))}
</div>

        <Button onClick={save} className="bg-green-600 text-white hover:bg-green-700 w-full">
          {editing ? "Update Student" : "Save Student"}
        </Button>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4 max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-3">
            <img src="/images/logo1.jpg" alt="Institute Logo" className="w-12 h-12 rounded-full border" />
            <div>
              <h1 className="text-xl font-bold text-green-800">Iqra Online Quran Institute</h1>
              <p className="text-sm text-gray-600">Student Management</p>
            </div>
          </div>

          <Button onClick={downloadPDF} className="bg-green-600 text-white hover:bg-green-700">
            Download PDF
          </Button>
        </div>

        <input
          type="text"
          placeholder="Search by name or roll no..."
          className="border p-2 rounded-lg w-full text-sm mb-3"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
                            <tr className="bg-green-100 text-left">
              <th className="p-3">Name</th>
              <th className="p-3">Roll</th>
              <th className="p-3">Class Days</th>
              <th className="p-3">Teachers</th>
              <th className="p-3 text-purple-700">Teacher Fee</th>
              <th className="p-3 text-blue-700">Academy Fee</th>
              <th className="p-3 text-green-700">Total Fee</th>
              <th className="p-3">Joining Date</th>
              <th className="p-3">Status</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((r) => (
              <tr key={r.id} className="border-t hover:bg-gray-50">
<td className="p-3 flex items-center gap-2">
  {r.name}
  {isNewStudent(r.join_date) && (
    <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full">
      NEW
    </span>
  )}
</td>
  <td className="p-3">{r.roll_no}</td>
<td className="p-3">
  {Array.isArray(r.class_days) && r.class_days.length > 0 ? (
    <ScheduleModal
      studentName={r.name}
      timezone={r.timezone || "Asia/Karachi"}
      classDays={r.class_days}
    />
  ) : (
    "—"
  )}
</td>
                <td className="p-3 text-purple-600 font-medium">{r.teacherNames.join(", ") || "—"}</td>
                <td className="p-3 text-purple-700 font-semibold">Rs {r.teacherFee}</td>
                <td className="p-3 text-blue-700 font-semibold">Rs {r.academy_fee}</td>
                <td className="p-3 text-green-700 font-bold">Rs {r.student_total_fee || 0}</td>
                <td>{r.join_date ? new Date(r.join_date).toLocaleDateString() : "—"}</td>
                <td className={`p-3 font-medium ${r.fee_status === "paid" ? "text-green-600" : "text-red-600"}`}>
                  {r.fee_status}
                </td>
                <td className="p-3 flex gap-2 flex-wrap">
                  <Button size="sm" variant="outline" onClick={() => editStudent(r)}>Edit</Button>
                  <Button size="sm" variant="outline" onClick={() => toggleFee(r.id, r.fee_status)}>Toggle Fee</Button>
                  <div className="flex gap-2">

  <div className="flex gap-2">

  {/* DELETE BUTTON */}
  <Button
    size="sm"
    variant="destructive"
    onClick={() => del(r.id)}   // ✅ CORRECT
  >
    Delete
  </Button>

  {/* DISABLE BUTTON */}
  <Button
  size="sm"
  variant="outline" // ✅ only valid variant
  className={r.status === "active" 
    ? "bg-yellow-500 text-white hover:bg-yellow-600" 
    : "bg-green-500 text-white hover:bg-green-600"}
  onClick={() => handleToggleStatus(r.id, r.status)}
>
  {r.status === "active" ? "Disable" : "Enable"}
</Button>

 


</div>


</div>

                </td>
              </tr>
            ))}
            {filteredRows.length === 0 && (
              <tr>
                <td colSpan={10} className="text-center text-gray-500 p-4">
                  No students found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
   </div>
  </div>
);
}

