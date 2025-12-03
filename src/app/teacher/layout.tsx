"use client";
import { useState } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";


export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-gray-50">

      <Sidebar
        role="teacher"
        open={sidebarOpen}
        toggleSidebar={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col">
        <Header
          role="teacher"
          toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />

        <main className=" ">
          {children}
        </main>
                  <Footer/>

      </div>
    </div>
  );
}
