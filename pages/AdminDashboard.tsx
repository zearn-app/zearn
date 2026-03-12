import React, { useState, useEffect } from 'react';
import { Layout } from '../components/Layout'; // Assuming this is your layout component
import { useNavigate } from 'react-router-dom';
import { Store } from '../services/store'; // Assuming this is your store service for Firebase
import { Bell, User, Shield, ChevronRight, LogOut } from 'lucide-react'; // Assuming these are your icons

// Define your task type
interface Task {
  id: string;
  taskName: string;
  fileName: string;
  password: string;
  innerFile: string;
  link: string;
  amount: string;
  type: string; // Task type (e.g., 'game', 'survey', etc.)
}

const AdminDashboard: React.FC = () => {
  const [tab, setTab] = useState("tasks"); // Default tab is tasks
  const [tasks, setTasks] = useState<Task[]>([]); // Store tasks from Firestore
  const [newTask, setNewTask] = useState({
    taskName: '',
    fileName: '',
    password: '',
    innerFile: '',
    link: '',
    amount: '',
    type: '',
  }); // New task input fields

  const navigate = useNavigate();

  // Fetch tasks from Firestore on component mount
  useEffect(() => {
    const fetchTasks = async () => {
      // Fetch tasks from Firestore (assuming Firestore is set up with a collection named 'tasks')
      const fetchedTasks = await Store.getAllTasks();
      setTasks(fetchedTasks);
    };

    fetchTasks();
  }, []);

  // Handle creating a new task
  const createTask = async () => {
    // Save new task to Firestore
    await Store.createTask(newTask);
    // Fetch updated task list after creating a new task
    const updatedTasks = await Store.getAllTasks();
    setTasks(updatedTasks);
    // Clear the new task form
    setNewTask({
      taskName: '',
      fileName: '',
      password: '',
      innerFile: '',
      link: '',
      amount: '',
      type: '',
    });
  };

  // Handle input changes for creating a new task
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewTask((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <Layout>
      <div className="p-4 space-y-4">
        {/* Tabs */}
        <div className="flex gap-4">
          <button onClick={() => setTab('tasks')} className={`px-4 py-2 ${tab === 'tasks' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
            Tasks
          </button>
          <button onClick={() => setTab('create')} className={`px-4 py-2 ${tab === 'create' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>
            Create Task
          </button>
        </div>

        {/* Task List Tab */}
        {tab === 'tasks' && (
          <div>
            <h2 className="text-xl font-bold">Task List</h2>
            <table className="min-w-full border-collapse mt-4">
              <thead>
                <tr>
                  <th className="px-4 py-2 border">Task Name</th>
                  <th className="px-4 py-2 border">File Name</th>
                  <th className="px-4 py-2 border">Password</th>
                  <th className="px-4 py-2 border">Inner File</th>
                  <th className="px-4 py-2 border">Link</th>
                  <th className="px-4 py-2 border">Amount</th>
                  <th className="px-4 py-2 border">Type</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr key={task.id}>
                    <td className="px-4 py-2 border">{task.taskName}</td>
                    <td className="px-4 py-2 border">{task.fileName}</td>
                    <td className="px-4 py-2 border">{task.password}</td>
                    <td className="px-4 py-2 border">{task.innerFile}</td>
                    <td className="px-4 py-2 border">{task.link}</td>
                    <td className="px-4 py-2 border">{task.amount}</td>
                    <td className="px-4 py-2 border">{task.type}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Create Task Tab */}
        {tab === 'create' && (
          <div>
            <h2 className="text-xl font-bold">Create Task</h2>
            <div className="mt-4 space-y-2">
              <input
                type="text"
                name="taskName"
                value={newTask.taskName}
                onChange={handleInputChange}
                placeholder="Task Name"
                className="px-4 py-2 border w-full"
              />
              <input
                type="text"
                name="fileName"
                value={newTask.fileName}
                onChange={handleInputChange}
                placeholder="File Name"
                className="px-4 py-2 border w-full"
              />
              <input
                type="password"
                name="password"
                value={newTask.password}
                onChange={handleInputChange}
                placeholder="Password"
                className="px-4 py-2 border w-full"
              />
              <input
                type="text"
                name="innerFile"
                value={newTask.innerFile}
                onChange={handleInputChange}
                placeholder="Inner File"
                className="px-4 py-2 border w-full"
              />
              <input
                type="url"
                name="link"
                value={newTask.link}
                onChange={handleInputChange}
                placeholder="Link"
                className="px-4 py-2 border w-full"
              />
              <input
                type="text"
                name="amount"
                value={newTask.amount}
                onChange={handleInputChange}
                placeholder="Amount"
                className="px-4 py-2 border w-full"
              />
              <input
                type="text"
                name="type"
                value={newTask.type}
                onChange={handleInputChange}
                placeholder="Type (e.g., game, survey)"
                className="px-4 py-2 border w-full"
              />
              <button
                onClick={createTask}
                className="px-4 py-2 bg-blue-500 text-white rounded mt-4"
              >
                Create Task
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AdminDashboard;