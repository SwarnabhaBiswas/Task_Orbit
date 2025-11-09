import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import KanbanBoard from "./pages/KanbanBoard";

function App() {
  return (
    <Router>
      <div className="flex h-screen bg-gray-50 text-gray-900">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <div className="flex flex-col flex-1 overflow-hidden">
          <Navbar />
          <main className="flex-1 p-8 overflow-y-auto bg-white">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/kanban" element={<KanbanBoard />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
