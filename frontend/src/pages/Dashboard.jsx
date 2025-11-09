function Dashboard() {
  const projects = {
    todo: [
      { id: 1, name: "Design Landing Page", due: "2025-11-12" },
      { id: 2, name: "Setup Database", due: "2025-11-20" },
    ],
    running: [
      { id: 3, name: "Develop Auth Module", due: "2025-11-25" },
      { id: 4, name: "Build REST API", due: "2025-12-05" },
    ],
    completed: [
      { id: 5, name: "UI Wireframes", due: "2025-10-30" },
      { id: 6, name: "Project Setup", due: "2025-10-20" },
    ],
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-bold mb-8 text-gray-800">Dashboard</h2>

      <div className="grid grid-cols-3 gap-6">
        {/* To Do Column */}
        <div className="bg-white rounded-xl shadow-md p-5">
          <h3 className="text-xl font-semibold mb-4 text-gray-700">📝 To Do</h3>
          <ul className="space-y-3">
            {projects.todo.map((proj) => (
              <li
                key={proj.id}
                className="border border-gray-200 rounded-lg p-3 hover:bg-gray-100"
              >
                <p className="font-medium text-gray-800">{proj.name}</p>
                <p className="text-sm text-gray-500">Due: {proj.due}</p>
              </li>
            ))}
          </ul>
        </div>

        {/* Running Column */}
        <div className="bg-white rounded-xl shadow-md p-5">
          <h3 className="text-xl font-semibold mb-4 text-gray-700">⚙️ Running</h3>
          <ul className="space-y-3">
            {projects.running.map((proj) => (
              <li
                key={proj.id}
                className="border border-gray-200 rounded-lg p-3 hover:bg-gray-100"
              >
                <p className="font-medium text-gray-800">{proj.name}</p>
                <p className="text-sm text-gray-500">Due: {proj.due}</p>
              </li>
            ))}
          </ul>
        </div>

        {/* Completed Column */}
        <div className="bg-white rounded-xl shadow-md p-5">
          <h3 className="text-xl font-semibold mb-4 text-gray-700">✅ Completed</h3>
          <ul className="space-y-3">
            {projects.completed.map((proj) => (
              <li
                key={proj.id}
                className="border border-gray-200 rounded-lg p-3 bg-green-50"
              >
                <p className="font-medium text-gray-800">{proj.name}</p>
                <p className="text-sm text-gray-500">Finished: {proj.due}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
