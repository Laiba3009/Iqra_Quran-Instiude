"use client";

import { useState, useEffect } from "react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [role, setRole] = useState("");

  // GET ROLE FROM LOCAL STORAGE
  useEffect(() => {
    const r = localStorage.getItem("userRole");
    if (r) setRole(r);
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar 
        role={role}
        open={sidebarOpen}
        toggleSidebar={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col">
        <Header 
          role={role}
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)} 
        />

        <main className="pt-20 md:pl-64 px-4">{children}</main>
      </div>
    </div>
  );
}
