import { Users, CreditCard, Book, FileText, CheckCircle, AlertTriangle, Calendar, X } from "lucide-react";

export const sidebars = {
  admin: [
    { name: "Dashboard", link: "/admin/dashboard", icon: Users },
    { name: "Manage Users", link: "/admin/users", icon: Users },
    { name: "Cancel Reasons", link: "/admin/cancel-reasons", icon: AlertTriangle },
    { name: "Fee Approvals", link: "/admin/fee-approvals", icon: CreditCard },
    { name: "Complaints", link: "/admin/complaints", icon: FileText },
    { name: "Logout", link: "#", icon: X, logout: true },

  ],
  teacher: [
    { name: "Dashboard", link: "/teacher/dashboard", icon: Users },
    { name: "Syllabus", link: "/teacher/syllabus", icon: Book },
    { name: "Attendance", link: "/teacher/attendance", icon: CheckCircle },
    { name: "Leave Management", link: "/teacher/teacher-leave", icon: Calendar },
    { name: "Logout", link: "#", icon: X, logout: true },
  ],
  student: [
    { name: "Dashboard", link: "/student/dashboard", icon: Users },
    { name: "Assignments", link: "/student/assignments", icon: FileText },
    { name: "Attendance", link: "/student/attendance", icon: CheckCircle },
    { name: "Logout", link: "#", icon: X, logout: true },
  ],
};
