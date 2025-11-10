import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Home,
  BarChart3,
  CheckSquare,
  Bell,
  Settings,
  LogOut,
  ChevronDown
} from "lucide-react";

function Sidebar() {
  const location = useLocation();
  const { logout } = useAuth();

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col min-h-screen">
      {/* Logo / Header */}
      <div className="flex items-center justify-between px-6 py-6 border-b border-gray-100">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mr-3">
            <span className="text-white font-bold text-sm">TO</span>
          </div>
          <h2 className="text-lg font-bold text-gray-900">Task Orbit</h2>
        </div>
        <ChevronDown size={16} className="text-gray-400" />
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-4 py-6">
        <ul className="space-y-1">
          <li>
            <Link
              to="/"
              className={`flex items-center gap-3 px-3 py-3 rounded-xl font-medium transition-colors ${
                location.pathname === "/"
                  ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg"
                  : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              <Home size={20} /> Dashboard
            </Link>
          </li>

          <li>
            <Link
              to="/tasks"
              className={`flex items-center gap-3 px-3 py-3 rounded-xl font-medium transition-colors ${
                location.pathname === "/tasks"
                  ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg"
                  : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              <CheckSquare size={20} /> My tasks
            </Link>
          </li>

          <li>
            <Link
              to="/notifications"
              className={`flex items-center gap-3 px-3 py-3 rounded-xl font-medium transition-colors ${
                location.pathname === "/notifications"
                  ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg"
                  : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              <Bell size={20} /> Notifications
            </Link>
          </li>
        </ul>
      </nav>

      {/* Bottom Navigation */}
      <div className="px-4 py-4 border-t border-gray-100">
        <ul className="space-y-1">
          <li>
            <Link
              to="/settings"
              className={`flex items-center gap-3 px-3 py-3 rounded-xl font-medium transition-colors ${
                location.pathname === "/settings"
                  ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg"
                  : "text-slate-700 hover:bg-slate-50"
              }`}
            >
              <Settings size={20} /> Settings
            </Link>
          </li>
          
          <li>
            <button 
              onClick={logout}
              className="flex items-center gap-3 px-3 py-3 rounded-xl font-medium text-slate-700 hover:bg-slate-50 transition-colors w-full text-left"
            >
              <LogOut size={20} /> Log out
            </button>
          </li>
        </ul>
      </div>
    </aside>
  );
}

export default Sidebar;
