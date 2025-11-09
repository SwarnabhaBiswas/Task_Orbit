import { Search } from "lucide-react";

function Navbar() {
  return (
    <header className="bg-white border-b border-gray-200 px-8 py-4 flex items-center justify-between">
      {/* Left */}
      <h1 className="text-lg font-semibold text-gray-700">Dashboard</h1>

      {/* Right: Search */}
      <div className="relative w-1/3">
        <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
        <input
          type="text"
          placeholder="Search Task"
          className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>
    </header>
  );
}

export default Navbar;
