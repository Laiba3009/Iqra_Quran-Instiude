"use client";
import Link from "next/link";
import { X } from "lucide-react";
import { useEffect, useState } from "react";

export default function Sidebar({ isOpen, closeSidebar }: { isOpen: boolean, closeSidebar: () => void }) {
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const storedRole = localStorage.getItem("userRole");
    setRole(storedRole);
  }, []);

  return (
    <>
      <aside
        className={`fixed top-0 left-0 w-64 h-full bg-[#001F3F] text-white transform ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out z-40 md:translate-x-0`}
      >
        <div className="flex justify-between items-center p-4 border-b border-blue-900">
          <h2 className="text-lg font-semibold capitalize">{role || "Panel"}</h2>
          <button onClick={closeSidebar} className="md:hidden">
            <X size={22} />
          </button>
        </div>

        {role ? (
          <nav className="p-4 space-y-4 text-sm">
            {role === "admin" && (
              <>
                <Link href="/admin/dashboard" className="block hover:text-blue-300">Dashboard</Link>
                <Link href="/admin/users" className="block hover:text-blue-300">Manage Users</Link>
              </>
            )}
            {role === "teacher" && (
              <>
                <Link href="/teacher/dashboard" className="block hover:text-blue-300">Dashboard</Link>
                <Link href="/teacher/syllabus" className="block hover:text-blue-300">Syllabus</Link>
                <Link href="/teacher/attendance" className="block hover:text-blue-300">View Attendance</Link>
              <Link href="/teacher/teacher-leave" className="block hover:text-blue-300">Leave Management</Link>
              <Link href="/teacher/rules" className="block hover:text-blue-300">
               Teacher Rules & Regulations
       </Link>



              </>
            )}
            {role === "student" && (
              <>
                <Link href="/student/dashboard" className="block hover:text-blue-300">Dashboard</Link>
                <Link href="/student/assignments" className="block hover:text-blue-300">Assignments</Link>
           <Link href="/student/assignments" className="block hover:text-blue-300">Assignments</Link>

              </>
            )}
          </nav>
        ) : (
          <p className="p-4 text-white">Loading...</p>
        )}
      </aside>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={closeSidebar}
        ></div>
      )}
    </>
  );
}
