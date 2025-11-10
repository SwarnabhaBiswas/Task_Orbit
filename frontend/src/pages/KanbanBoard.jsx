import { useEffect, useMemo, useState } from "react";
import { api } from "../services/api";

function KanbanBoard() {
  const [items, setItems] = useState([]);
  useEffect(() => {
    api.get('/api/tasks').then(({ data }) => setItems(data)).catch(() => setItems([]));
  }, []);
  const tasks = useMemo(() => ({
    todo: items.filter(t => t.status === 'todo'),
    inProgress: items.filter(t => t.status === 'in_progress' || t.status === 'review'),
    done: items.filter(t => t.status === 'done'),
  }), [items]);

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h2 className="text-3xl font-bold mb-8 text-gray-800">Analytics</h2>

      <div className="grid grid-cols-3 gap-6">
        {/* To Do Column */}
        <div className="bg-white rounded-xl shadow-md p-5">
          <h3 className="text-xl font-semibold mb-4 text-gray-700">📝 To Do</h3>
          <div className="space-y-3">
            {tasks.todo.map((task) => (
              <div
                key={task._id}
                className="p-3 border border-gray-200 rounded-lg hover:bg-gray-100"
              >
                {task.title}
              </div>
            ))}
          </div>
        </div>

        {/* In Progress Column */}
        <div className="bg-white rounded-xl shadow-md p-5">
          <h3 className="text-xl font-semibold mb-4 text-gray-700">⚙️ In Progress</h3>
          <div className="space-y-3">
            {tasks.inProgress.map((task) => (
              <div
                key={task._id}
                className="p-3 border border-gray-200 rounded-lg hover:bg-yellow-50"
              >
                {task.title}
              </div>
            ))}
          </div>
        </div>

        {/* Done Column */}
        <div className="bg-white rounded-xl shadow-md p-5">
          <h3 className="text-xl font-semibold mb-4 text-gray-700">✅ Done</h3>
          <div className="space-y-3">
            {tasks.done.map((task) => (
              <div
                key={task._id}
                className="p-3 border border-gray-200 rounded-lg bg-green-50"
              >
                {task.title}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default KanbanBoard;
