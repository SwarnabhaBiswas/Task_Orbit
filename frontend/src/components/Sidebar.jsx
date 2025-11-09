import { Link, useLocation } from "react-router-dom";
import {
  Home,
  LayoutDashboard,
  MessageSquare,
  Calendar,
  Layers,
  User,
  Settings,
} from "lucide-react";

function Sidebar() {
  const location = useLocation(); // to detect current active route

  return (
    <aside className="w-64 bg-gray-50 border-r border-gray-200 flex flex-col min-h-screen">
      {/* Logo / Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b">
        <h2 className="text-xl font-semibold text-gray-800">Taskboard</h2>
        <span className="text-xs bg-black text-white px-2 py-0.5 rounded">▼</span>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-6 py-6 space-y-8">
        {/* Main Menu Section */}
        <div>
          <p className="text-sm text-gray-500 uppercase mb-3">Menu</p>
          <ul className="space-y-2">
            <li>
              <Link
                to="/"
                className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition ${
                  location.pathname === "/"
                    ? "bg-black text-white"
                    : "text-gray-700 hover:bg-gray-200"
                }`}
              >
                <Home size={18} /> Dashboard
              </Link>
            </li>

            <li>
              <Link
                to="/kanban"
                className={`flex items-center gap-3 px-3 py-2 rounded-lg font-medium transition ${
                  location.pathname === "/kanban"
                    ? "bg-black text-white"
                    : "text-gray-700 hover:bg-gray-200"
                }`}
              >
                <LayoutDashboard size={18} /> Kanban Board
              </Link>
            </li>

            <li>
              <Link
                to="/chat"
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-200 transition"
              >
                <MessageSquare size={18} /> Chat
              </Link>
            </li>

            <li>
              <Link
                to="/calendar"
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-200 transition"
              >
                <Calendar size={18} /> Calendar
              </Link>
            </li>

            <li>
              <Link
                to="/template"
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-200 transition"
              >
                <Layers size={18} /> Template
              </Link>
            </li>
          </ul>
        </div>

        {/* Account Section */}
        <div>
          <p className="text-sm text-gray-500 uppercase mb-3">Account</p>
          <ul className="space-y-2">
            <li>
              <Link
                to="/account"
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-200 transition"
              >
                <User size={18} /> Account
              </Link>
            </li>

            <li>
              <Link
                to="/settings"
                className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-200 transition"
              >
                <Settings size={18} /> Settings
              </Link>
            </li>
          </ul>
        </div>
      </nav>
    </aside>
  );
}

export default Sidebar;
