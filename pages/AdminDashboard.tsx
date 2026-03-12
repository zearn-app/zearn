import React, { useState, useEffect } from "react";
import { Layout } from "../components/Layout"; // assuming Layout is a wrapper for your dashboard
import { useNavigate } from "react-router-dom"; // navigation to route
import { Store } from "../services/store"; // assuming you have a store service
import { Task } from "../types"; // Task type
import { X } from "lucide-react"; // Assuming this is used for close icon

// Task interface based on your model
interface Task {
  id: string;
  taskName: string;
  fileName: string;
  password: string;
  innerFile: string;
  link: string;
  amount: string;
  IsSpecial: boolean;
  Package?: string; // Optional field if IsSpecial is true
}

const AdminDashboard: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [editingTask, setEditingTask] = useState<Task | null>(null); // Task for editing
  const [taskForm, setTaskForm] = useState<Task>({
    id: "",
    taskName: "",
    fileName: "",
    password: "",
    innerFile: "",
    link: "",
    amount: "",
    IsSpecial: false,
    Package: "",
  });
  const navigate = useNavigate();

  // Fetch tasks from store or API
  useEffect(() => {
    const fetchTasks = async () => {
      // Simulate fetching tasks from Firestore or backend service
      const fetchedTasks: Task[] = await Store.getAllTasks(); // replace with your actual data fetching logic
      setTasks(fetchedTasks);
    };
    fetchTasks();
  }, []);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setTaskForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle checkbox change for IsSpecial
  const handleIsSpecialChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { checked } = e.target;
    setTaskForm((prev) => ({
      ...prev,
      IsSpecial: checked,
      Package: checked ? prev.Package : "", // Reset Package if IsSpecial is false
    }));
  };

  // Handle form submission for creating or editing a task
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingTask) {
      // Update task if editing
      await Store.updateTask(taskForm); // Replace with your actual update function
    } else {
      // Create new task
      await Store.createTask(taskForm); // Replace with your actual create function
    }

    setTaskForm({
      id: "",
      taskName: "",
      fileName: "",
      password: "",
      innerFile: "",
      link: "",
      amount: "",
      IsSpecial: false,
      Package: "",
    });
    setEditingTask(null);
    // Optionally navigate or update UI after submission
    navigate("/admin/dashboard"); // Navigate to dashboard or another page
  };

  // Handle task edit
  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setTaskForm(task);
  };

  // Handle task delete (if applicable)
  const handleDeleteTask = async (id: string) => {
    await Store.deleteTask(id); // Replace with your actual delete function
    setTasks(tasks.filter((task) => task.id !== id));
  };

  return (
    <Layout>
      <div className="admin-dashboard">
        <h1>Admin Dashboard</h1>
        <button onClick={() => setEditingTask(null)}>Create New Task</button>

        {/* Task List */}
        <div className="task-list">
          <h2>Tasks</h2>
          <ul>
            {tasks.map((task) => (
              <li key={task.id}>
                <span>{task.taskName}</span>
                <button onClick={() => handleEditTask(task)}>Edit</button>
                <button onClick={() => handleDeleteTask(task.id)}>Delete</button>
              </li>
            ))}
          </ul>
        </div>

        {/* Task Form for creating or editing */}
        <div className="task-form">
          <h2>{editingTask ? "Edit Task" : "Create Task"}</h2>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="taskName"
              value={taskForm.taskName}
              onChange={handleInputChange}
              placeholder="Task Name"
              required
            />
            <input
              type="text"
              name="fileName"
              value={taskForm.fileName}
              onChange={handleInputChange}
              placeholder="File Name"
              required
            />
            <input
              type="password"
              name="password"
              value={taskForm.password}
              onChange={handleInputChange}
              placeholder="Password"
              required
            />
            <input
              type="text"
              name="innerFile"
              value={taskForm.innerFile}
              onChange={handleInputChange}
              placeholder="Inner File"
              required
            />
            <input
              type="url"
              name="link"
              value={taskForm.link}
              onChange={handleInputChange}
              placeholder="Link"
              required
            />
            <input
              type="number"
              name="amount"
              value={taskForm.amount}
              onChange={handleInputChange}
              placeholder="Amount"
              required
            />
            <div>
              <label>
                Is Special?
                <input
                  type="checkbox"
                  checked={taskForm.IsSpecial}
                  onChange={handleIsSpecialChange}
                />
              </label>
              {taskForm.IsSpecial && (
                <input
                  type="text"
                  name="Package"
                  value={taskForm.Package}
                  onChange={handleInputChange}
                  placeholder="Package"
                  required
                />
              )}
            </div>

            <button type="submit">{editingTask ? "Update Task" : "Create Task"}</button>
            {editingTask && <button onClick={() => setEditingTask(null)}>Cancel</button>}
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;