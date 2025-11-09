"use client";

import { useState, useEffect } from "react";
import Sidebar from "../Sidebar";
import Header from "../Header";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const [activePath, setActivePath] = useState<string>("");

  useEffect(() => {
    const storedRole = localStorage.getItem("userRole");
    setRole(storedRole);

    // Current route
    setActivePath(window.location.pathname);
  }, []);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar
        isOpen={sidebarOpen}
        closeSidebar={closeSidebar}
        role={role}
        activePath={activePath}
      />

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <Header toggleSidebar={toggleSidebar} />

        {/* Page content */}
        <main className="pt-16 p-6">{children}</main>
      </div>
    </div>
  );
}
