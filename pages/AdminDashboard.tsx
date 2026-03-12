import React, { useEffect, useState } from "react";  
import { Layout } from "../components/Layout";  
import { Store } from "../services/store";  
import {  
  User,  
  Task,  
  WithdrawalRequest,  
  WithdrawalStatus,  
  AdminSettings  
} from "../types";  

import { X } from "lucide-react";  

const AdminDashboard: React.FC = () => {  

  const [tab, setTab] = useState("withdrawals");  

  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);  
  const [users, setUsers] = useState<User[]>([]);  
  const [tasks, setTasks] = useState<Task[]>([]);  
  const [settings, setSettings] = useState<AdminSettings | null>(null);  

  const [jackpotHistory, setJackpotHistory] = useState<any[]>([]);  

  const [search, setSearch] = useState("");  
  const [filter, setFilter] = useState("ALL");  
  const [withdrawType, setWithdrawType] = useState("ALL");  

  const [coinFilter, setCoinFilter] = useState("ALL");  
  const [rankFilter, setRankFilter] = useState("ALL");  
  const [placeFilter, setPlaceFilter] = useState("");  

  const [taskModal, setTaskModal] = useState(false);  
  const [editingTask, setEditingTask] = useState<Task | null>(null);  

  const [taskForm, setTaskForm] = useState({  
    id: "",  
    title: "",  
    reward: 0,  
    isSpecial: false,  
    link: "",  
    expectedZipName: "",  
    password: "",  
    expectedInnerFileName: "",  
    expectedapkName: "",  
    Package: "",  
  });  

  useEffect(() => {  
    loadAll();  
  }, []);  

  const loadAll = async () => {  
    const w = await Store.getWithdrawals();  
    const u = await Store.getAllUsers();  
    const t = await Store.getAllTasks();  
    const s = await Store.getSettings();  

    let j: any[] = [];  
    j = await Store.getWinnerEntries();  

    setWithdrawals(w);  
    setUsers(u);  
    setTasks(t);  
    setSettings(s);  
    setJackpotHistory(j);  
  };  

  // Tasks Creation and Update Form  
  const saveTask = async (e: React.FormEvent) => {  
    e.preventDefault();  

    if (!taskForm.title) {  
      alert("Title required");  
      return;  
    }  

    try {  
      let payload: any = {  
        id: taskForm.id,  
        title: taskForm.title,  
        reward: taskForm.reward,  
        isSpecial: taskForm.isSpecial,  
        link: taskForm.link,  
      };

      if (taskForm.isSpecial) {
        payload.expectedapkName = taskForm.expectedapkName;
        payload.Package = taskForm.Package;
      } else {
        payload.expectedZipName = taskForm.expectedZipName;
        payload.password = taskForm.password;
        payload.expectedInnerFileName = taskForm.expectedInnerFileName;
      }

      if (editingTask) {
        await Store.updateTask(editingTask.id, payload);
      } else {
        await Store.createTask(payload);
      }

      setTaskModal(false);
      await loadAll();
    } catch (err) {
      console.error(err);
      alert("Failed to save task");
    }
  };

  const openCreateTask = () => {
    setEditingTask(null);
    setTaskForm({
      id: "",
      title: "",
      reward: 0,
      isSpecial: false,
      link: "",
      expectedZipName: "",
      password: "",
      expectedInnerFileName: "",
      expectedapkName: "",
      Package: "",
    });
    setTaskModal(true);
  };

  const openEditTask = (task: Task) => {
    setEditingTask(task);
    setTaskForm({
      id: task.id || "",
      title: task.title || "",
      reward: task.reward || 0,
      isSpecial: task.isSpecial || false,
      link: task.link || "",
      expectedZipName: task.expectedZipName || "",
      password: task.password || "",
      expectedInnerFileName: task.expectedInnerFileName || "",
      expectedapkName: task.expectedapkName || "",
      Package: task.Package || "",
    });
    setTaskModal(true);
  };

  const deleteTask = async (id: string) => {
    if (!window.confirm("Delete task?")) return;
    await Store.deleteTask(id);
    await loadAll();
  };

  return (
    <Layout>
      <div className="p-3 space-y-4">

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto">
          {["withdrawals", "users", "tasks", "settings", "jackpot"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded font-bold ${
                tab === t ? "bg-black text-white" : "bg-gray-200"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* ================= TASKS ================= */}
        {tab === "tasks" && (
          <div className="space-y-3">
            <div className="flex justify-between">
              <h2 className="font-bold text-lg">Tasks</h2>
              <button
                onClick={openCreateTask}
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                Create Task
              </button>
            </div>
            {tasks.map((t) => (
              <div key={t.id} className="border bg-white p-3 rounded flex justify-between items-center">
                <div>
                  <b>{t.title}</b>
                  <div className="text-xs text-gray-500">Reward: {t.reward}</div>
                  <div className="text-xs">
                    Type: {t.isSpecial ? "Special APK Task" : "Normal ZIP Task"}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => openEditTask(t)}
                    className="bg-yellow-400 px-3 py-1 rounded"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => deleteTask(t.id)}
                    className="bg-red-500 text-white px-3 py-1 rounded"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ================= TASK MODAL ================= */}
        {taskModal && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
            <form onSubmit={saveTask} className="bg-white p-5 rounded w-[95%] max-w-md space-y-3">
              <div className="flex justify-between">
                <h3 className="font-bold">{editingTask ? "Edit Task" : "Create Task"}</h3>
                <button type="button" onClick={() => setTaskModal(false)}>
                  <X />
                </button>
              </div>

              {/* Task ID */}
              <input
                placeholder="Task ID"
                value={taskForm.id}
                onChange={(e) => setTaskForm({ ...taskForm, id: e.target.value })}
                className="border p-2 rounded w-full"
              />

              {/* Title */}
              <input
                placeholder="Title"
                value={taskForm.title}
                onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                className="border p-2 rounded w-full"
              />

              {/* Reward */}
              <input
                type="number"
                placeholder="Reward"
                value={taskForm.reward}
                onChange={(e) => setTaskForm({ ...taskForm, reward: Number(e.target.value) })}
                className="border p-2 rounded w-full"
              />

              {/* Special Task Toggle */}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setTaskForm({ ...taskForm, isSpecial: false })}
                  className={`px-3 py-1 rounded ${!taskForm.isSpecial ? "bg-blue-600 text-white" : "bg-gray-200"}`}
                >
                  Normal
                </button>
                <button
                  type="button"
                  onClick={() => setTaskForm({ ...taskForm, isSpecial: true })}
                  className={`px-3 py-1 rounded ${taskForm.isSpecial ? "bg-blue-600 text-white" : "bg-gray-200"
}
                >
                  Special
                </button>
              </div>

              {/* For Normal Task (ZIP Task) */}
              {!taskForm.isSpecial && (
                <>
                  <input
                    placeholder="Expected ZIP Name"
                    value={taskForm.expectedZipName}
                    onChange={(e) =>
                      setTaskForm({ ...taskForm, expectedZipName: e.target.value })
                    }
                    className="border p-2 rounded w-full"
                  />

                  <input
                    placeholder="ZIP Password"
                    value={taskForm.password}
                    onChange={(e) =>
                      setTaskForm({ ...taskForm, password: e.target.value })
                    }
                    className="border p-2 rounded w-full"
                  />

                  <input
                    placeholder="Inner File Name"
                    value={taskForm.expectedInnerFileName}
                    onChange={(e) =>
                      setTaskForm({ ...taskForm, expectedInnerFileName: e.target.value })
                    }
                    className="border p-2 rounded w-full"
                  />
                </>
              )}

              {/* For Special Task (APK Task) */}
              {taskForm.isSpecial && (
                <>
                  <input
                    placeholder="Expected APK Name"
                    value={taskForm.expectedapkName}
                    onChange={(e) =>
                      setTaskForm({ ...taskForm, expectedapkName: e.target.value })
                    }
                    className="border p-2 rounded w-full"
                  />

                  <input
                    placeholder="Package Name"
                    value={taskForm.Package}
                    onChange={(e) =>
                      setTaskForm({ ...taskForm, Package: e.target.value })
                    }
                    className="border p-2 rounded w-full"
                  />
                </>
              )}

              {/* Download Link */}
              <input
                placeholder="Download Link"
                value={taskForm.link}
                onChange={(e) => setTaskForm({ ...taskForm, link: e.target.value })}
                className="border p-2 rounded w-full"
              />

              {/* Save Task Button */}
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded w-full"
              >
                Save Task
              </button>
            </form>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default AdminDashboard;