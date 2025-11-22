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

    // -------- LOGO --------
    if (logoUrl) {
      try {
        doc.addImage(logoUrl, "JPG", 25, 20, 50, 50);
      } catch (e) {
        console.warn("Logo failed", e);
      }
    }

    // -------- HEADING --------
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(26);
    doc.text("Iqra Online Institute", 90, 50);

    // -------- STUDENT INFO BOX --------
    doc.setFillColor(235, 235, 235);
    doc.rect(20, 90, 560, 70, "F");

    doc.setFont("Helvetica", "bold");
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text("Student Information", 30, 110);

    doc.setFont("Helvetica", "normal");
    doc.setFontSize(12);
    doc.text(`Name: ${student.name}`, 30, 135);
    doc.text(`Roll No: ${student.roll_no || "—"}`, 30, 155);
    doc.text(`Teacher: ${student.teacher_name}`, 250, 135);
    doc.text(`Month: ${month || "All"}`, 250, 155);

    let y = 190;

    // -------- LIGHT PASTEL COLORS --------
    const pastelColors = [
      [255, 240, 245], // light rose pink
      [230, 240, 255], // soft sky blue
      [232, 250, 235], // mint green
      [255, 250, 230], // creamy yellow
    ];

    // -------- WEEKLY REPORT SECTION --------
    reports.forEach((r, idx) => {
      const color = pastelColors[idx % pastelColors.length];

      // WEEK TITLE — Stylish
     // WEEK TITLE — Stylish Dark Blue
doc.setFont("Helvetica", "bold");
doc.setFontSize(16);
doc.setTextColor(0, 45, 98);        // 🔵 Dark Navy Blue Title

doc.text(`WEEK ${idx + 1}`, 20, y);
doc.line(20, y + 3, 120, y + 3);    // underline width increased (optional)


      y += 15;

      // Big box
      doc.setFillColor(color[0], color[1], color[2]);
      doc.rect(20, y, 560, 90, "F");

      doc.setFont("Helvetica", "normal");
      doc.setFontSize(12);
      doc.setTextColor(0, 0, 0);

      doc.text(`Date: ${new Date(r.created_at).toLocaleDateString()}`, 30, y + 25);
      doc.text(`Teacher: ${r.teacher_name}`, 30, y + 40);

      const wrappedText = doc.splitTextToSize(r.report_text, 520);
      doc.text(wrappedText, 30, y + 60);

      y += 110;
    });

    // -------- NOTES SECTION --------
    complaints.forEach((c) => {
      doc.setFont("Helvetica", "bold");
      doc.setFontSize(16);
doc.setTextColor(0, 45, 98);        // 🔵 Dark Navy Blue Title
      doc.text("NOTICE", 20, y);
      doc.line(20, y + 3, 85, y + 3);
      y += 15;

      // Light red box
      doc.setFillColor(255, 235, 238);
      doc.rect(20, y, 560, 90, "F");

      doc.setFont("Helvetica", "normal");
      doc.setFontSize(12);
      doc.text(`Date: ${new Date(c.created_at).toLocaleDateString()}`, 30, y + 25);
      doc.text(`Teacher: ${c.teacher_name}`, 30, y + 40);

      const wrapped = doc.splitTextToSize(c.complaint_text, 520);
      doc.text(wrapped, 30, y + 60);

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
