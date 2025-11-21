import { Users, CreditCard, Book, FileText, CheckCircle, AlertTriangle, Calendar, X } from "lucide-react";

export const sidebars = {
  admin: [
    { name: "Dashboard", link: "/admin/dashboard", icon: Users },          
    { name: " Student Cancel Class", link: "/admin/cancel-reasons", icon: AlertTriangle },
    { name: "Teacher Suggestions List", link: "/admin/teacher-suggestions", icon: AlertTriangle },
    { name: "Fee Approvals", link: "/admin/fee-approvals", icon: CreditCard },
    { name: "Students Complaints", link: "/admin/complaints", icon: FileText },
        { name: "Syllabus", link: "/student/syllabus/student/syllabus", icon: FileText },
    { name: "Student Monthly Reports", link: "/admin/montly-reports", icon: FileText },
        { name: "Teachers Salary Managemenet", link: "/admin/teachers", icon: Users },          
    { name: "Teacher Bank List", link: "/admin/teacher-bank-list", icon: Users },
    { name: "Logout", link: "#", icon: X, logout: true },

  ],
  teacher: [
    { name: "Dashboard", link: "/teacher/dashboard", icon: Users },
    { name: "Syllabus", link: "/teacher/syllabus", icon: Book },
    { name: "Attendance", link: "/teacher/attendance", icon: CheckCircle },
    { name: "Leave Management", link: "/teacher/teacher-leave", icon: Calendar },
          { name: "Salary Records", link: "/teacher/salary-record", icon: Book },

        { name: "Bank Details", link: "/teacher/bank-details", icon: Users },
      { name: "Rules & Regulation", link: "/teacher/rules", icon: Book },
    { name: "Logout", link: "#", icon: X, logout: true },
  ],
  student: [
    { name: "Dashboard", link: "/student/dashboard", icon: Users },
        { name: "Class Schedule", link: "/student/class-schedule", icon: Users },
    { name: "Assignments", link: "/student/assignments", icon: FileText },
    { name: "Syllabus", link: "/student/view-syllabus", icon: CheckCircle },
    { name: "Logout", link: "#", icon: X, logout: true },
    { name: "Rules & Regulation", link: "/student/rules", icon: Users },

  ],
};
