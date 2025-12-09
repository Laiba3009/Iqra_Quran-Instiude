"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";


export default function AdminLayout({ children }: { children: React.ReactNode }) {

  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className=" bg-gray-50">

      <Sidebar
        role="admin"                 // ← IMPORTANT FIX
        open={sidebarOpen}
        toggleSidebar={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col">

        <Header 
          role="admin"               // optional, but safe
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)} 
        />

        <main className="pt-18">
          {children}
        </main>
          
      </div>
    </div>
  );
}
