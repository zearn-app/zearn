import React, { useEffect, useState } from "react";
import { Layout } from "../components/Layout";
import { Store } from "../services/store";
import { useNotification } from "../components/NotificationSystem";

import {
  Trash2,
  Plus,
  Edit,
  Check,
  X,
  Search,
  Coins,
  Ban,
  Unlock,
  Settings,
  Users,
  ListChecks
} from "lucide-react";

import {
  WithdrawalRequest,
  WithdrawalStatus,
  User,
  Task,
  AdminSettings
} from "../types";

const AdminDashboard: React.FC = () => {
  const { notify } = useNotification();

  const [activeTab, setActiveTab] = useState<
    "withdrawals" | "users" | "tasks" | "settings"
  >("withdrawals");

  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [settings, setSettings] = useState<AdminSettings | null>(null);

  const [withdrawSearch, setWithdrawSearch] = useState("");
  const [withdrawFilter, setWithdrawFilter] = useState("all");

  const [userSearch, setUserSearch] = useState("");

  const [taskModal, setTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const [taskData, setTaskData] = useState({
    id: "",
    title: "",
    reward: 0,
    isSpecial: false,
    expectedZipName: "",
    password: "",
    expectedInnerFileName: ""
  });

  const [coinAmount, setCoinAmount] = useState(0);

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    try {
      const [w, u, t, s] = await Promise.all([
        Store.getWithdrawals(),
        Store.getAllUsers(),
        Store.getAllTasks(true),
        Store.getSettings()
      ]);

      setWithdrawals(w);
      setUsers(u);
      setTasks(t);
      setSettings(s);
    } catch (e) {
      console.error(e);
    }
  };

  // ==========================
  // Withdrawal Logic
  // ==========================

  const updateWithdrawal = async (id: string, status: WithdrawalStatus) => {
    await Store.adminUpdateWithdrawal(id, status);
    notify("Withdrawal updated", "success");
    loadData();
  };

  const filteredWithdrawals = withdrawals.filter((w) => {
    const user = users.find((u) => u.uid === w.uid);

    const matchesSearch =
      user?.name?.toLowerCase().includes(withdrawSearch.toLowerCase()) ||
      user?.phone?.includes(withdrawSearch);

    const matchesFilter =
      withdrawFilter === "all" || w.status === withdrawFilter;

    return matchesSearch && matchesFilter;
  });

  // ==========================
  // User Logic
  // ==========================

  const toggleBan = async (user: User) => {
    await Store.toggleUserBan(user.uid, user.isBanned);
    notify("User updated", "success");
    loadData();
  };

  const addCoins = async (uid: string) => {
    if (!coinAmount) return;

    await Store.adminAddCoins(uid, coinAmount);

    notify("Coins added", "success");
    setCoinAmount(0);

    loadData();
  };

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(userSearch.toLowerCase())
  );

  // ==========================
  // Task Logic
  // ==========================

  const openCreateTask = () => {
    setEditingTask(null);
    setTaskModal(true);

    setTaskData({
      id: "",
      title: "",
      reward: 0,
      isSpecial: false,
      expectedZipName: "",
      password: "",
      expectedInnerFileName: ""
    });
  };

  const openEditTask = (task: Task) => {
    setEditingTask(task);

    setTaskData({
      id: task.id,
      title: task.title,
      reward: task.reward,
      isSpecial: task.isSpecial,
      expectedZipName: task.expectedZipName || "",
      password: task.password || "",
      expectedInnerFileName: task.expectedInnerFileName || ""
    });

    setTaskModal(true);
  };

  const saveTask = async () => {
    if (!taskData.title) return notify("Title required", "error");

    if (editingTask) {
      await Store.updateTask(editingTask.id, taskData);
      notify("Task updated", "success");
    } else {
      await Store.createTask(taskData);
      notify("Task created", "success");
    }

    setTaskModal(false);
    loadData();
  };

  const deleteTask = async (id: string) => {
    if (!window.confirm("Delete task?")) return;

    await Store.deleteTask(id);
    notify("Task deleted", "success");

    loadData();
  };

  // ==========================
  // Jackpot Winner
  // ==========================

  const selectJackpotWinner = async () => {
    const winner = users[Math.floor(Math.random() * users.length)];

    await Store.setJackpotWinner(winner.uid);

    notify(`Winner: ${winner.name}`, "success");
  };

  // ==========================
  // Settings
  // ==========================

  const saveSettings = async () => {
    if (!settings) return;

    await Store.updateSettings(settings);

    notify("Settings updated", "success");
  };

  // ==========================
  // UI
  // ==========================

  return (
    <Layout>
      <div className="space-y-6">

        {/* Tabs */}

        <div className="flex gap-3">

          <button onClick={() => setActiveTab("withdrawals")} className="btn">
            Withdrawals
          </button>

          <button onClick={() => setActiveTab("users")} className="btn">
            Users
          </button>

          <button onClick={() => setActiveTab("tasks")} className="btn">
            Tasks
          </button>

          <button onClick={() => setActiveTab("settings")} className="btn">
            Settings
          </button>

        </div>

        {/* ========================= */}
        {/* Withdrawals */}
        {/* ========================= */}

        {activeTab === "withdrawals" && (
          <div>

            <div className="flex gap-3 mb-4">

              <input
                placeholder="Search user"
                className="input"
                value={withdrawSearch}
                onChange={(e) => setWithdrawSearch(e.target.value)}
              />

              <select
                className="input"
                value={withdrawFilter}
                onChange={(e) => setWithdrawFilter(e.target.value)}
              >
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="rejected">Rejected</option>
              </select>

            </div>

            <div className="space-y-3">

              {filteredWithdrawals.map((w) => {

                const user = users.find((u) => u.uid === w.uid);

                return (
                  <div key={w.id} className="card">

                    <div>{user?.name}</div>
                    <div>₹ {w.amount}</div>

                    <div className="flex gap-2">

                      <button
                        onClick={() =>
                          updateWithdrawal(w.id, WithdrawalStatus.PAID_BY_ADMIN)
                        }
                      >
                        <Check />
                      </button>

                      <button
                        onClick={() =>
                          updateWithdrawal(w.id, WithdrawalStatus.REJECTED)
                        }
                      >
                        <X />
                      </button>

                    </div>

                  </div>
                );
              })}

            </div>
          </div>
        )}

        {/* ========================= */}
        {/* USERS */}
        {/* ========================= */}

        {activeTab === "users" && (
          <div>

            <input
              placeholder="Search user"
              className="input mb-4"
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
            />

            <div className="space-y-3">

              {filteredUsers.map((u) => (
                <div key={u.uid} className="card">

                  <div>{u.name}</div>
                  <div>Coins: {u.coins}</div>

                  <div className="flex gap-2">

                    <button onClick={() => toggleBan(u)}>
                      {u.isBanned ? <Unlock /> : <Ban />}
                    </button>

                    <input
                      type="number"
                      placeholder="coins"
                      className="input w-24"
                      onChange={(e) => setCoinAmount(Number(e.target.value))}
                    />

                    <button onClick={() => addCoins(u.uid)}>
                      <Coins />
                    </button>

                  </div>

                </div>
              ))}

            </div>
          </div>
        )}

        {/* ========================= */}
        {/* TASKS */}
        {/* ========================= */}

        {activeTab === "tasks" && (
          <div>

            <button onClick={openCreateTask} className="btn mb-4">
              <Plus /> Create Task
            </button>

            <div className="space-y-3">

              {tasks.map((t) => (
                <div key={t.id} className="card flex justify-between">

                  <div>
                    {t.title} — {t.reward} coins
                  </div>

                  <div className="flex gap-2">

                    <button onClick={() => openEditTask(t)}>
                      <Edit />
                    </button>

                    <button onClick={() => deleteTask(t.id)}>
                      <Trash2 />
                    </button>

                  </div>

                </div>
              ))}

            </div>
          </div>
        )}

        {/* ========================= */}
        {/* SETTINGS */}
        {/* ========================= */}

        {activeTab === "settings" && settings && (
          <div className="space-y-4">

            <input
              className="input"
              value={settings.minWithdrawal}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  minWithdrawal: Number(e.target.value)
                })
              }
              placeholder="Minimum withdrawal"
            />

            <input
              className="input"
              value={settings.dailyClaimLimit}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  dailyClaimLimit: Number(e.target.value)
                })
              }
              placeholder="Daily claim amount"
            />

            <input
              className="input"
              value={settings.randomWinnerEntryFee}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  randomWinnerEntryFee: Number(e.target.value)
                })
              }
              placeholder="Jackpot entry amount"
            />

            <input
              className="input"
              value={settings.adminPassword}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  adminPassword: e.target.value
                })
              }
              placeholder="Admin password"
            />

            <button onClick={saveSettings} className="btn">
              Save Settings
            </button>

            <button onClick={selectJackpotWinner} className="btn">
              Select Jackpot Winner
            </button>

          </div>
        )}

      </div>
    </Layout>
  );
};

export default AdminDashboard;
