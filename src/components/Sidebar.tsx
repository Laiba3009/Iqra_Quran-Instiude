import React from "react";
import { X } from "lucide-react";
import { sidebars } from "../data/SidebarData";

const Sidebar = ({ role, open, toggleSidebar }) => {
  return (
    <>
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-blue-900 text-white shadow-lg transform transition-transform duration-300 z-50 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-blue-700">
          <h2 className="text-lg font-bold capitalize">{role} Panel</h2>
          <button onClick={toggleSidebar} className="hover:text-red-400">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Links */}
        <nav className="p-4 space-y-2">
          {sidebars[role].map((item) => {
            const Icon = item.icon;
            return (
              <a
                key={item.name}
                href={item.link}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
              </a>
            );
          })}
        </nav>
      </div>

      {/* Overlay for mobile */}
      {open && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={toggleSidebar}
        ></div>
      )}
    </>
  );
};

export default Sidebar;
