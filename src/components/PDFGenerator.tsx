'use client';

import jsPDF from "jspdf";
import { Button } from "@/components/ui/button";

interface Student {
  id: string;
  name: string;
  roll_no?: string;
  teacher_name: string;
}

interface Report {
  id: string;
  report_text: string;
  created_at: string;
  teacher_name: string;
}

interface Complaint {
  id: string;
  complaint_text: string;
  created_at: string;
  teacher_name: string;
}

interface PDFGeneratorProps {
  student: Student;
  reports: Report[];
  complaints: Complaint[];
  month?: string;
  logoUrl?: string;
}

export default function PDFGenerator({ student, reports, complaints, month, logoUrl }: PDFGeneratorProps) {
  const generatePDF = () => {
    const doc = new jsPDF("p", "pt");

    // ======= TOP DATE (PDF Download Date) =======
    const today = new Date().toLocaleDateString();

    // ======= UNIQUE TEACHER NAME LIST =======
    const teacherSet = new Set<string>();
    teacherSet.add(student.teacher_name);

    reports.forEach((r) => teacherSet.add(r.teacher_name));
    complaints.forEach((c) => teacherSet.add(c.teacher_name));

    const teacherList = Array.from(teacherSet).join(", ");

    // ======= LOGO =======
    if (logoUrl) {
      try {
        doc.addImage(logoUrl, "JPG", 25, 20, 50, 50);
      } catch (e) {
        console.warn("Logo load error", e);
      }
    }

    // ======= MAIN TITLE =======
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(26);
    doc.text("Iqra Online Institute", 90, 50);

    // ======= TOP INFO BOX =======
    doc.setFillColor(235, 235, 235);
    doc.rect(20, 90, 560, 90, "F");

    doc.setFontSize(14);
    doc.text("Progress Report", 30, 110);

    doc.setFont("Helvetica", "normal");
    doc.setFontSize(12);
    doc.text(`Date: ${today}`, 30, 135);   // ★ ONLY this date now

    doc.text(`Teachers: ${teacherList}`, 30, 155); // ★ ALL teachers here
    doc.text(`Month: ${month || "All"}`, 350, 155);

    doc.text(`Student Name: ${student.name}`, 350, 135);

    let y = 210;

    // ======= SOFT COLORS =======
    const pastelColors = [
      [255, 240, 245],
      [230, 240, 255],
      [232, 250, 235],
      [255, 250, 230],
    ];

    // ---------------------------------------------------
    //                WEEKLY REPORT (WITHOUT DATE/TEACHER)
    // ---------------------------------------------------
    reports.forEach((r, idx) => {
      const color = pastelColors[idx % pastelColors.length];

      // WEEK TITLE
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(16);
      doc.setTextColor(0, 45, 98);
      doc.text(`WEEK ${idx + 1}`, 20, y);
      doc.line(20, y + 3, 120, y + 3);
      y += 15;

      // Box
      doc.setFillColor(color[0], color[1], color[2]);
      doc.rect(20, y, 560, 90, "F");

      // Text Only (No date, no teacher)
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(12);

      const wrapped = doc.splitTextToSize(r.report_text, 520);
      doc.text(wrapped, 30, y + 35);

      y += 110;
    });

    // ---------------------------------------------------
    //                COMPLAINTS / NOTICE
    // ---------------------------------------------------
    complaints.forEach((c) => {
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(16);
      doc.setTextColor(0, 45, 98);
      doc.text("NOTICE", 20, y);
      doc.line(20, y + 3, 85, y + 3);
      y += 15;

      doc.setFillColor(255, 235, 238);
      doc.rect(20, y, 560, 90, "F");

      doc.setFont("Helvetica", "normal");
      doc.setFontSize(12);

      const wrapped = doc.splitTextToSize(c.complaint_text, 520);
      doc.text(wrapped, 30, y + 35);

      y += 110;
    });

    doc.save(`${student.name}_Progress_Report.pdf`);
  };

  return (
    <Button onClick={generatePDF} className="bg-blue-600 text-white">
      Download PDF
    </Button>
  );
}
