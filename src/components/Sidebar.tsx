"use client";

import Link from "next/link";
import { X, Users, CreditCard, Book, FileText, CheckCircle, AlertTriangle, Calendar } from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  closeSidebar: () => void;
  role: string | null;
  activePath: string;
}

export default function Sidebar({ isOpen, closeSidebar, role, activePath }: SidebarProps) {
  const linkClass = (href: string) =>
    `flex items-center gap-2 p-2 rounded hover:bg-blue-700 transition-colors ${
      activePath === href ? "bg-blue-800" : ""
    }`;

  const handleLogout = () => {
    localStorage.removeItem("userRole");
    localStorage.removeItem("userId");
    document.cookie = "portal_role=; path=/; max-age=0";
    window.location.href =
      role === "admin" ? "/admin/signin" : role === "teacher" ? "/teacher/signin" : "/login";
  };

  return (
    <>
      <aside
        className={`fixed top-0 left-0 w-64 h-full bg-[#001F3F] text-white transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out z-40`}
      >
        {/* Cross button */}
        {isOpen && (
          <button
            onClick={closeSidebar}
            className="absolute top-4 right-4 text-white hover:text-red-400"
          >
            <X size={22} />
          </button>
        )}

        <div className="flex justify-between items-center p-4 border-b border-blue-900">
          <h2 className="text-lg font-semibold capitalize">{role ? `${role} Dashboard` : "Panel"}</h2>
        </div>

        {role ? (
          <nav className="p-4 space-y-2 text-sm">
            {/* Admin Links */}
            {role === "admin" && (
              <>
                <Link href="/admin/dashboard" className={linkClass("/admin/dashboard")}>
                  <Users size={18} /> Dashboard
                </Link>
                <Link href="/admin/users" className={linkClass("/admin/users")}>
                  <Users size={18} /> Manage Users
                </Link>
                <Link href="/admin/cancel-reasons" className={linkClass("/admin/cancel-reasons")}>
                  <AlertTriangle size={18} /> Cancel Reasons
                </Link>
                <Link href="/admin/fee-approvals" className={linkClass("/admin/fee-approvals")}>
                  <CreditCard size={18} /> Fee Approvals
                </Link>
                <Link href="/admin/complaints" className={linkClass("/admin/complaints")}>
                  <FileText size={18} /> Complaints
                </Link>
                <button onClick={handleLogout} className={linkClass("#")}>
                  <X size={18} /> Logout
                </button>
              </>
            )}

            {/* Teacher Links */}
            {role === "teacher" && (
              <>
                <Link href="/teacher/dashboard" className={linkClass("/teacher/dashboard")}>
                  <Users size={18} /> Dashboard
                </Link>
                <Link href="/teacher/syllabus" className={linkClass("/teacher/syllabus")}>
                  <Book size={18} /> Syllabus
                </Link>
                <Link href="/teacher/attendance" className={linkClass("/teacher/attendance")}>
                  <CheckCircle size={18} /> Attendance
                </Link>
                <Link href="/teacher/teacher-leave" className={linkClass("/teacher/teacher-leave")}>
                  <Calendar size={18} /> Leave Management
                </Link>
                <button onClick={handleLogout} className={linkClass("#")}>
                  <X size={18} /> Logout
                </button>
              </>
            )}

            {/* Student Links */}
            {role === "student" && (
              <>
                <Link href="/student/dashboard" className={linkClass("/student/dashboard")}>
                  <Users size={18} /> Dashboard
                </Link>
                <Link href="/student/assignments" className={linkClass("/student/assignments")}>
                  <FileText size={18} /> Assignments
                </Link>
                <Link href="/student/attendance" className={linkClass("/student/attendance")}>
                  <CheckCircle size={18} /> Attendance
                </Link>
                <button onClick={handleLogout} className={linkClass("#")}>
                  <X size={18} /> Logout
                </button>
              </>
            )}
          </nav>
        ) : (
          <p className="p-4 text-white">Loading...</p>
        )}
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden" onClick={closeSidebar}></div>
      )}
    </>
  );
}
