import Link from "next/link";
import { X } from "lucide-react";
import { sidebars } from "@/lib/sidebarData";

export default function Sidebar({ role, open, toggleSidebar }) {
  const links = sidebars[role] || [];

  return (
    <aside
      className={`fixed top-0 left-0 w-64 h-full bg-[#001F3F] text-white transform ${
        open ? "translate-x-0" : "-translate-x-full"
      } transition-transform duration-300 ease-in-out z-40`}
    >
      <div className="flex justify-between items-center p-4 border-b border-blue-900">
        <h2 className="text-lg font-semibold">{role?.toUpperCase()}</h2>
        <button onClick={toggleSidebar} className="md:hidden hover:text-red-400">
          <X size={22} />
        </button>
      </div>

      <nav className="p-4 space-y-2 text-sm">
        {links.map((link) =>
          link.logout ? (
            <button
              key={link.name}
              className="flex items-center gap-2 p-2 rounded hover:bg-blue-700 w-full"
              onClick={() => {
                localStorage.removeItem("userRole");
                localStorage.removeItem("userId");
                window.location.href = "/signin";
              }}
            >
              <link.icon size={18} /> {link.name}
            </button>
          ) : (
            <Link
              key={link.name}
              href={link.link}
              className="flex items-center gap-2 p-2 rounded hover:bg-blue-700"
            >
              <link.icon size={18} /> {link.name}
            </Link>
          )
        )}
      </nav>
    </aside>
  );
}
