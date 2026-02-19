"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50">

      {/* Sidebar */}
      <Sidebar
        role="admin"
        open={sidebarOpen}
        toggleSidebar={() => setSidebarOpen(false)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col">

        <Header 
          role="admin"
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)} 
        />

        {/* Main area fills available space */}
        <main className="flex-1 p-4">
          {children}
        </main>

        {/* Footer always bottom */}
        <Footer />

      </div>
    </div>
  );
}
