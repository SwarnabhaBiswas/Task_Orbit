import { useState } from "react";

export default function useTasks() {
  const [tasks, setTasks] = useState([
    { id: 1, title: "Design UI", description: "Create mockups", status: "Completed" },
    { id: 2, title: "Build API", description: "Set up backend endpoints", status: "Pending" },
  ]);

  const addTask = (task) => setTasks((prev) => [...prev, task]);

  return { tasks, addTask };
}
