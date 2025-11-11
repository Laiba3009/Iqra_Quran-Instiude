import { Users, CreditCard, Book, FileText, CheckCircle, AlertTriangle, Calendar, X } from "lucide-react";

export const sidebars = {
  admin: [
    { name: "Dashboard", link: "/admin/dashboard", icon: Users },          
    { name: "Manage Users", link: "/admin/users", icon: Users },
    { name: " Student Cancel Class", link: "/admin/cancel-reasons", icon: AlertTriangle },
    { name: "Teacher Suggestions List", link: "/admin/teacher-suggestions", icon: AlertTriangle },
    { name: "Fee Approvals", link: "/admin/fee-approvals", icon: CreditCard },
    { name: "Students Complaints", link: "/admin/complaints", icon: FileText },
        { name: "Syllabus", link: "/student/syllabus/student/syllabus", icon: FileText },

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
        { name: "Class Schedule", link: "/student/class-schedule", icon: Users },
    { name: "Assignments", link: "/student/assignments", icon: FileText },
    { name: "Syllabus", link: "/student/view-syllabus", icon: CheckCircle },
    { name: "Logout", link: "#", icon: X, logout: true },
  ],
};
