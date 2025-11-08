'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

interface Student {
  id: string
  name: string
  roll_no: string
  syllabus: string[] | null
  class_time: string | null
  teacher_name: string
}

interface Report {
  id: string
  report_text: string
  created_at: string
  teacher_name: string
}

interface Complaint {
  id: string
  complaint_text: string
  created_at: string
  teacher_name: string
}

export default function AdminProgressPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [reports, setReports] = useState<Report[]>([])
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [loading, setLoading] = useState(true)
  const [openModal, setOpenModal] = useState<'report' | 'complaint' | null>(
    null
  )

  useEffect(() => {
    loadStudents()
  }, [])

  const loadStudents = async () => {
    setLoading(true)

    const { data, error } = await supabase
      .from('student_teachers')
      .select(`
        students ( id, name, roll_no, syllabus, class_time ),
        teachers ( name )
      `)

    if (error) console.error(error)

    const parsed =
      data?.map((d) => ({
        id: d.students.id,
        name: d.students.name,
        roll_no: d.students.roll_no,
        syllabus: d.students.syllabus,
        class_time: d.students.class_time,
        teacher_name: d.teachers.name,
      })) ?? []

    setStudents(parsed)
    setLoading(false)
  }

  const loadReports = async (studentId: string) => {
    const { data, error } = await supabase
      .from('student_progress')
      .select(`
        id,
        report_text,
        created_at,
        teachers:teacher_id(name)
      `)
      .eq('student_id', studentId)
      .order('created_at', { ascending: false })

    if (error) console.error(error)

    const parsed =
      data?.map((r) => ({
        id: r.id,
        report_text: r.report_text,
        created_at: r.created_at,
        teacher_name: r.teachers?.name || '—',
      })) ?? []

    setReports(parsed)
  }

  const loadComplaints = async (studentId: string) => {
    const { data, error } = await supabase
      .from('student_complaints')
      .select(`
        id,
        complaint_text,
        created_at,
        teachers:teacher_id(name)
      `)
      .eq('student_id', studentId)
      .order('created_at', { ascending: false })

    if (error) console.error(error)

    const parsed =
      data?.map((r) => ({
        id: r.id,
        complaint_text: r.complaint_text,
        created_at: r.created_at,
        teacher_name: r.teachers?.name || '—',
      })) ?? []

    setComplaints(parsed)
  }

  const handleOpenReport = (student: Student) => {
    setSelectedStudent(student)
    loadReports(student.id)
    setOpenModal('report')
  }

  const handleOpenComplaint = (student: Student) => {
    setSelectedStudent(student)
    loadComplaints(student.id)
    setOpenModal('complaint')
  }

  const exportPDF = (type: 'report' | 'complaint') => {
    if (!selectedStudent) return
    const doc = new jsPDF()
    doc.text(
      `${selectedStudent.name} - ${
        type === 'report' ? 'Progress Reports' : 'Complaints'
      }`,
      14,
      15
    )

    const data =
      type === 'report'
        ? reports.map((r) => [
            new Date(r.created_at).toLocaleDateString(),
            r.teacher_name,
            r.report_text,
          ])
        : complaints.map((c) => [
            new Date(c.created_at).toLocaleDateString(),
            c.teacher_name,
            c.complaint_text,
          ])

    autoTable(doc, {
      startY: 25,
      head: [['Date', 'Teacher', type === 'report' ? 'Report' : 'Complaint']],
      body: data,
    })

    doc.save(
      `${selectedStudent.name}_${type === 'report' ? 'reports' : 'complaints'}.pdf`
    )
  }

  return (
    <div className="max-w-6xl mx-auto mt-12 p-6 bg-white rounded-xl shadow">
      <h1 className="text-3xl font-bold text-green-800 mb-6 text-center">
        🧑‍🎓 All Students Overview
      </h1>

      {loading ? (
        <p className="text-center text-gray-500">Loading students...</p>
      ) : students.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-200 rounded-lg text-left">
            <thead className="bg-green-100 text-green-800">
              <tr>
                <th className="p-3 border-b">Student Name</th>
                <th className="p-3 border-b">Roll No</th>
                <th className="p-3 border-b">Teacher</th>
                <th className="p-3 border-b">Syllabus</th>
                <th className="p-3 border-b">Class Time</th>
                <th className="p-3 border-b text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50 transition">
                  <td className="p-3">{s.name}</td>
                  <td className="p-3">{s.roll_no}</td>
                  <td className="p-3">{s.teacher_name}</td>
                  <td className="p-3 text-sm text-gray-600">
                    {s.syllabus?.length ? s.syllabus.join(', ') : '—'}
                  </td>
                  <td className="p-3 text-sm text-gray-600">
                    {s.class_time || '—'}
                  </td>
                  <td className="p-3 flex justify-center gap-2">
                    <Button
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700 text-white"
                      onClick={() => handleOpenReport(s)}
                    >
                      Daily Report
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-red-500 text-red-600 hover:bg-red-50"
                      onClick={() => handleOpenComplaint(s)}
                    >
                      Complaints
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-center text-gray-500">No students found.</p>
      )}

      {/* 🔹 Report Modal */}
      <Dialog open={openModal === 'report'} onOpenChange={() => setOpenModal(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              📘 Progress Reports - {selectedStudent?.name}
            </DialogTitle>
          </DialogHeader>

          {reports.length > 0 ? (
            <table className="w-full border-collapse border border-gray-200 text-left">
              <thead className="bg-green-100">
                <tr>
                  <th className="p-3 border-b">Date</th>
                  <th className="p-3 border-b">Teacher</th>
                  <th className="p-3 border-b">Report</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((r) => (
                  <tr key={r.id} className="border-t hover:bg-gray-50 transition">
                    <td className="p-3">
                      {new Date(r.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-3">{r.teacher_name}</td>
                    <td className="p-3">{r.report_text}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-gray-500">No reports available.</p>
          )}

          <DialogFooter>
            <Button onClick={() => exportPDF('report')} className="bg-green-600 text-white">
              Download PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 🔹 Complaint Modal */}
      <Dialog open={openModal === 'complaint'} onOpenChange={() => setOpenModal(null)}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>
              ⚠️ Complaints - {selectedStudent?.name}
            </DialogTitle>
          </DialogHeader>

          {complaints.length > 0 ? (
            <table className="w-full border-collapse border border-gray-200 text-left">
              <thead className="bg-red-100">
                <tr>
                  <th className="p-3 border-b">Date</th>
                  <th className="p-3 border-b">Teacher</th>
                  <th className="p-3 border-b">Complaint</th>
                </tr>
              </thead>
              <tbody>
                {complaints.map((c) => (
                  <tr key={c.id} className="border-t hover:bg-gray-50 transition">
                    <td className="p-3">
                      {new Date(c.created_at).toLocaleDateString()}
                    </td>
                    <td className="p-3">{c.teacher_name}</td>
                    <td className="p-3">{c.complaint_text}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-gray-500">No complaints available.</p>
          )}

          <DialogFooter>
            <Button onClick={() => exportPDF('complaint')} className="bg-red-600 text-white">
              Download PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
