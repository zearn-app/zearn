import React, { useState, useEffect } from "react";
import { Layout } from "../components/Layout";
import { Store } from "../services/store";
import {
  WithdrawalRequest,
  WithdrawalStatus,
  User,
  Task,
  AdminSettings
} from "../types";

import {
  Search,
  Ban,
  Unlock,
  Plus,
  Trash2,
  Edit,
  Check,
  X,
  Coins,
  Trophy
} from "lucide-react";

const AdminDashboard: React.FC = () => {

  const [tab, setTab] = useState<
    "withdrawals" | "users" | "tasks" | "settings"
  >("withdrawals");

  const [users, setUsers] = useState<User[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  const [searchUser, setSearchUser] = useState("");
  const [searchWithdrawal, setSearchWithdrawal] = useState("");

  const [settings, setSettings] = useState<AdminSettings>({
    minWithdrawal: 50,
    dailyClaimLimit: 10,
    adminPassword: "admin",
    randomWinnerEntryFee: 20,
    tapCount: 5
  });

  const [taskForm, setTaskForm] = useState<any>({
    id: "",
    title: "",
    reward: 10,
    isSpecial: false,
    expectedZipName: "",
    password: "",
    expectedInnerFileName: ""
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setUsers(await Store.getUsers());
    setWithdrawals(await Store.getWithdrawalRequests());
    setTasks(await Store.getTasks());
  };

  /* ---------------- USERS ---------------- */

  const toggleBan = async (user: User) => {
    user.isBanned = !user.isBanned;
    await Store.updateUser(user);
    loadData();
  };

  const addCoins = async (uid: string) => {
    const amount = Number(prompt("Enter coins"));
    if (!amount) return;

    const user = users.find((u) => u.uid === uid);
    if (!user) return;

    user.balance += amount;

    await Store.updateUser(user);
    loadData();
  };

  /* ---------------- WITHDRAWALS ---------------- */

  const approveWithdrawal = async (req: WithdrawalRequest) => {
    req.status = WithdrawalStatus.APPROVED;
    await Store.updateWithdrawal(req);
    loadData();
  };

  const rejectWithdrawal = async (req: WithdrawalRequest) => {
    req.status = WithdrawalStatus.REJECTED;
    await Store.updateWithdrawal(req);
    loadData();
  };

  /* ---------------- TASKS ---------------- */

  const createTask = async () => {
    await Store.createTask(taskForm);
    setTaskForm({});
    loadData();
  };

  const deleteTask = async (id: string) => {
    await Store.deleteTask(id);
    loadData();
  };

  const editTask = async (task: Task) => {
    setTaskForm(task);
  };

  /* ---------------- JACKPOT ---------------- */

  const pickJackpotWinner = () => {
    const random = users[Math.floor(Math.random() * users.length)];
    alert(`Winner: ${random.name}`);
  };

  /* ---------------- FILTERS ---------------- */

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(searchUser.toLowerCase())
  );

  const filteredWithdrawals = withdrawals.filter((w) =>
    w.uid.toLowerCase().includes(searchWithdrawal.toLowerCase())
  );

  return (
    <Layout title="Admin Dashboard">

      {/* NAVIGATION */}

      <div className="flex gap-2 mb-6">
        <button onClick={() => setTab("withdrawals")}>Withdrawals</button>
        <button onClick={() => setTab("users")}>Users</button>
        <button onClick={() => setTab("tasks")}>Tasks</button>
        <button onClick={() => setTab("settings")}>Settings</button>
      </div>

      {/* ---------------- WITHDRAWALS ---------------- */}

      {tab === "withdrawals" && (
        <div>

          <div className="flex items-center mb-4">
            <Search size={16} />
            <input
              placeholder="Search withdrawal"
              value={searchWithdrawal}
              onChange={(e) => setSearchWithdrawal(e.target.value)}
            />
          </div>

          {filteredWithdrawals.map((req) => (
            <div key={req.id} className="card">

              <div>
                <p>User: {req.uid}</p>
                <p>Amount: ₹{req.amount}</p>
                <p>Status: {req.status}</p>
              </div>

              <div className="flex gap-2">

                <button onClick={() => approveWithdrawal(req)}>
                  <Check size={16} />
                  Approve
                </button>

                <button onClick={() => rejectWithdrawal(req)}>
                  <X size={16} />
                  Reject
                </button>

              </div>

            </div>
          ))}

        </div>
      )}

      {/* ---------------- USERS ---------------- */}

      {tab === "users" && (
        <div>

          <div className="flex items-center mb-4">
            <Search size={16} />
            <input
              placeholder="Search user"
              value={searchUser}
              onChange={(e) => setSearchUser(e.target.value)}
            />
          </div>

          {filteredUsers.map((u) => (
            <div key={u.uid} className="card flex justify-between">

              <div>
                <p>{u.name}</p>
                <p>{u.balance} Coins</p>
              </div>

              <div className="flex gap-2">

                <button onClick={() => toggleBan(u)}>
                  {u.isBanned ? <Unlock size={16} /> : <Ban size={16} />}
                </button>

                <button onClick={() => addCoins(u.uid)}>
                  <Coins size={16} />
                </button>

              </div>

            </div>
          ))}

        </div>
      )}

      {/* ---------------- TASKS ---------------- */}

      {tab === "tasks" && (
        <div>

          <h3>Create Task</h3>

          <input
            placeholder="Task ID"
            value={taskForm.id}
            onChange={(e) =>
              setTaskForm({ ...taskForm, id: e.target.value })
            }
          />

          <input
            placeholder="Title"
            value={taskForm.title}
            onChange={(e) =>
              setTaskForm({ ...taskForm, title: e.target.value })
            }
          />

          <input
            placeholder="Reward"
            type="number"
            value={taskForm.reward}
            onChange={(e) =>
              setTaskForm({ ...taskForm, reward: Number(e.target.value) })
            }
          />

          <input
            placeholder="ZIP Name"
            value={taskForm.expectedZipName}
            onChange={(e) =>
              setTaskForm({
                ...taskForm,
                expectedZipName: e.target.value
              })
            }
          />

          <input
            placeholder="ZIP Password"
            value={taskForm.password}
            onChange={(e) =>
              setTaskForm({ ...taskForm, password: e.target.value })
            }
          />

          <input
            placeholder="Inner File Name"
            value={taskForm.expectedInnerFileName}
            onChange={(e) =>
              setTaskForm({
                ...taskForm,
                expectedInnerFileName: e.target.value
              })
            }
          />

          <button onClick={createTask}>
            <Plus size={16} />
            Create Task
          </button>

          <hr />

          {tasks.map((t) => (
            <div key={t.id} className="card flex justify-between">

              <div>
                <p>{t.title}</p>
                <p>Reward: {t.reward}</p>
              </div>

              <div className="flex gap-2">

                <button onClick={() => editTask(t)}>
                  <Edit size={16} />
                </button>

                <button onClick={() => deleteTask(t.id)}>
                  <Trash2 size={16} />
                </button>

              </div>

            </div>
          ))}

        </div>
      )}

      {/* ---------------- SETTINGS ---------------- */}

      {tab === "settings" && (
        <div>

          <h3>Admin Settings</h3>

          <input
            type="number"
            value={settings.minWithdrawal}
            onChange={(e) =>
              setSettings({
                ...settings,
                minWithdrawal: Number(e.target.value)
              })
            }
          />

          <input
            type="number"
            value={settings.dailyClaimLimit}
            onChange={(e) =>
              setSettings({
                ...settings,
                dailyClaimLimit: Number(e.target.value)
              })
            }
          />

          <input
            value={settings.adminPassword}
            onChange={(e) =>
              setSettings({
                ...settings,
                adminPassword: e.target.value
              })
            }
          />

          <input
            type="number"
            value={settings.randomWinnerEntryFee}
            onChange={(e) =>
              setSettings({
                ...settings,
                randomWinnerEntryFee: Number(e.target.value)
              })
            }
          />

          <button onClick={() => Store.saveSettings(settings)}>
            Save Settings
          </button>

          <hr />

          <button onClick={pickJackpotWinner}>
            <Trophy size={16} />
            Pick Jackpot Winner
          </button>

        </div>
      )}

    </Layout>
  );
};

export default AdminDashboard;
