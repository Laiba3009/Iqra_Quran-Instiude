"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";          

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50">

      {/* Sidebar */}
      <Sidebar
        role="student"
        open={sidebarOpen}
        toggleSidebar={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col">

        {/* Header */}
        <Header
          role="student"
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />

        {/* Page content */}
        <main className="pt-20 ">
          {children}
        </main>
           <Footer/>

      </div>
    </div>
  );
}
