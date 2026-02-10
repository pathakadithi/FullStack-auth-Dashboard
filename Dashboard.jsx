import { api } from "../api";
import { useEffect, useState } from "react";
import { logout } from "../auth";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState("");
  const navigate = useNavigate();

  const fetchTasks = async () => {
    const res = await api.get("/tasks");
    setTasks(res.data);
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const addTask = async () => {
    if (!title.trim()) return;

    await api.post("/tasks", { title });
    setTitle("");
    fetchTasks();
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

 return (
  <div className="min-h-screen bg-pink-100 py-10">
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8">
      
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          🚀 Dashboard
        </h1>
        <button
  onClick={handleLogout}
  className="bg-red-600 text-white px-4 py-2 rounded z-50 relative"
>
  Logout
</button>
      </div>

      <h2 className="text-xl font-semibold mb-3">Add a Task</h2>

      <div className="flex gap-2 mb-6">
        <input
          className="flex-1 border rounded px-3 py-2"
          placeholder="Enter task name"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <button
          onClick={addTask}
          className="bg-green-600 hover:bg-green-700 text-white px-4 rounded"
        >
          Add
        </button>
      </div>

      <h2 className="text-xl font-semibold mb-3">Your Tasks</h2>

      {tasks.length === 0 && (
        <p className="text-gray-500">No tasks added yet</p>
      )}

      <div className="space-y-2">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="border rounded px-3 py-2 bg-gray-50"
          >
            {task.title}
          </div>
        ))}
      </div>
    </div>
  </div>
)
}