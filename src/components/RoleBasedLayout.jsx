import React, { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function RoleBasedLayout({ role, children }) {
  const [open, setOpen] = useState(false);
  const toggleSidebar = () => setOpen(!open);

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar role={role} open={open} toggleSidebar={toggleSidebar} />

      <div className="flex-1 flex flex-col">
        {/* Header with Logo + Links + Sidebar button */}
        <Header toggleSidebar={toggleSidebar} role={role} />
        <main className="flex-1 p-6 mt-16">{children}</main> {/* mt-16 for fixed header */}
      </div>
    </div>
  );
}
