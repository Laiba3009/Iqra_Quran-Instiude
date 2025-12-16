import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

type Attendance = {
  teacher_name: string;
  subject: string;
  joined_at: string;
  status?: "Present" | "Absent";
};

export const downloadAttendancePDF = (
  data: Attendance[],
  studentName: string,
  studentRoll: string
) => {
  if (!data || data.length === 0) return;

  const doc = new jsPDF();

  // ✅ FIXED COUNTS (default Present)
  const totalPresent = data.filter(
    (d) => (d.status || "Present") === "Present"
  ).length;

  const totalAbsent = data.filter(
    (d) => d.status === "Absent"
  ).length;

  // Logo
  const logo = "/images/logo1.jpg";
  if (logo) doc.addImage(logo, "PNG", 14, 10, 18, 18);

  // Header
  doc.setFontSize(18);
  doc.text("Iqra Online Institute", 40, 22);

  doc.setFontSize(14);
  doc.text("Attendance Report", 14, 38);

  doc.setFontSize(11);
  doc.text(`Student: ${studentName}`, 14, 46);
  doc.text(`Roll No: ${studentRoll}`, 14, 52);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 58);

  // Table
  const tableData = data.map((rec, i) => [
    i + 1,
    rec.teacher_name,
    rec.subject,
    rec.status || "Present",
    new Date(rec.joined_at).toLocaleString(),
  ]);

  autoTable(doc, {
    head: [["#", "Teacher", "Subject", "Status", "Time"]],
    body: tableData,
    startY: 66,
    styles: { fontSize: 10 },
    headStyles: { fillColor: [22, 160, 133] },
    didParseCell(cell) {
      if (cell.section === "body" && cell.column.index === 3) {
        if (cell.cell.text[0] === "Present")
          cell.cell.styles.textColor = [0, 150, 0];
        if (cell.cell.text[0] === "Absent")
          cell.cell.styles.textColor = [200, 0, 0];
      }
    },
  });

  // Totals
  const y = (doc as any).lastAutoTable.finalY + 10;

  doc.setTextColor(0, 150, 0);
  doc.text(`Total Presents: ${totalPresent}`, 14, y);

  doc.setTextColor(200, 0, 0);
  doc.text(`Total Absents: ${totalAbsent}`, 14, y + 8);

  doc.setTextColor(0, 0, 0);

  doc.save(`Attendance_${studentRoll}.pdf`);
};
